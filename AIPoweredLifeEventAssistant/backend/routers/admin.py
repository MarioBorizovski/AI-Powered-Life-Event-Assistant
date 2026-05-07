from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, func

from database import get_session
from models import User, Request, UserRead, RequestRead, TodoRead, DocumentRead, ServiceRead, Todo, Document, Service
from auth import require_admin
from services.ai_service import LIFE_EVENTS

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/stats")
def get_stats(
    session: Session = Depends(get_session),
    _admin: User = Depends(require_admin),
):
    """Return system-wide statistics for the admin dashboard."""
    total_users = session.exec(select(func.count()).select_from(User)).one()
    total_requests = session.exec(select(func.count()).select_from(Request)).one()
    pending = session.exec(
        select(func.count()).select_from(Request).where(Request.status == "pending")
    ).one()
    completed = session.exec(
        select(func.count()).select_from(Request).where(Request.status == "completed")
    ).one()
    cancelled = session.exec(
        select(func.count()).select_from(Request).where(Request.status == "cancelled")
    ).one()

    by_event = []
    for evt in LIFE_EVENTS:
        cnt = session.exec(
            select(func.count()).select_from(Request).where(Request.life_event == evt["value"])
        ).one()
        if cnt > 0:
            by_event.append({"lifeEvent": evt["label"], "count": cnt})

    return {
        "totalUsers": total_users,
        "totalRequests": total_requests,
        "pendingRequests": pending,
        "completedRequests": completed,
        "cancelledRequests": cancelled,
        "requestsByLifeEvent": by_event,
    }


@router.get("/users", response_model=list[UserRead])
def list_users(
    session: Session = Depends(get_session),
    _admin: User = Depends(require_admin),
):
    """List all users (admin only)."""
    users = session.exec(select(User).order_by(User.created_at.desc())).all()
    return [UserRead.model_validate(u) for u in users]


@router.get("/users/{user_id}")
def get_user_detail(
    user_id: str,
    session: Session = Depends(get_session),
    _admin: User = Depends(require_admin),
):
    """Get detailed info for a single user including their request count."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Корисникот не е пронајден")

    requests = session.exec(select(Request).where(Request.user_id == user_id)).all()
    completed_count = len([r for r in requests if r.status == "completed"])

    return {
        **UserRead.model_validate(user).model_dump(),
        "requestsCount": len(requests),
        "completedRequestsCount": completed_count,
    }


@router.patch("/users/{user_id}/role")
def update_user_role(
    user_id: str,
    body: dict,
    session: Session = Depends(get_session),
    _admin: User = Depends(require_admin),
):
    """Change a user's role (user/admin)."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Корисникот не е пронајден")

    new_role = body.get("role")
    if new_role not in ("user", "admin"):
        raise HTTPException(status_code=400, detail="Невалидна улога")

    user.role = new_role
    session.add(user)
    session.commit()
    return {"message": "Улогата е ажурирана", "role": new_role}


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: str,
    session: Session = Depends(get_session),
    admin: User = Depends(require_admin),
):
    """Delete a user and all their data (admin only)."""
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Не може да се избришете самите себе")

    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Корисникот не е пронајден")

    requests = session.exec(select(Request).where(Request.user_id == user_id)).all()
    for req in requests:
        for todo in session.exec(select(Todo).where(Todo.request_id == req.id)).all():
            session.delete(todo)
        for doc in session.exec(select(Document).where(Document.request_id == req.id)).all():
            session.delete(doc)
        for svc in session.exec(select(Service).where(Service.request_id == req.id)).all():
            session.delete(svc)
        session.delete(req)

    session.delete(user)
    session.commit()


@router.get("/requests", response_model=list[RequestRead])
def list_all_requests(
    session: Session = Depends(get_session),
    _admin: User = Depends(require_admin),
):
    """List ALL requests across all users (admin only)."""
    requests = session.exec(select(Request).order_by(Request.created_at.desc())).all()
    result = []
    for req in requests:
        todos = session.exec(select(Todo).where(Todo.request_id == req.id)).all()
        docs = session.exec(select(Document).where(Document.request_id == req.id)).all()
        svcs = session.exec(select(Service).where(Service.request_id == req.id)).all()
        result.append(RequestRead(
            id=req.id,
            user_id=req.user_id,
            life_event=req.life_event,
            description=req.description,
            status=req.status,
            created_at=req.created_at,
            todos=[TodoRead.model_validate(t) for t in todos],
            documents=[DocumentRead.model_validate(d) for d in docs],
            services=[ServiceRead.model_validate(s) for s in svcs],
        ))
    return result


@router.get("/life-events")
def list_life_events(_admin: User = Depends(require_admin)):
    """Return the list of available life event categories."""
    return LIFE_EVENTS
