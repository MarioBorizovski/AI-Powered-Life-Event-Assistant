import json
import logging
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from database import get_session
from models import (
    User, Request, Todo, Document, Service,
    RequestCreate, RequestRead, TodoRead, DocumentRead, ServiceRead,
)
from auth import get_current_user
from services.ai_service import generate_life_event_plan

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/events", tags=["Life Events"])


@router.post("/", response_model=RequestRead, status_code=status.HTTP_201_CREATED)
async def create_event(
    data: RequestCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Create a new life event and auto-generate tasks, documents, services."""
    req = Request(
        user_id=current_user.id,
        life_event=data.life_event,
        description=data.description,
        options=json.dumps(data.options) if data.options else None,
    )
    session.add(req)
    session.commit()
    session.refresh(req)

    logger.info("Creating life event plan for event=%s user=%s", data.life_event, current_user.id)
    plan = await generate_life_event_plan(data.life_event, data.description or "")

    for t in plan.get("todos", []):
        todo = Todo(
            request_id=req.id,
            text=t.get("text", ""),
            description=t.get("description", ""),
            deadline=datetime.fromisoformat(t["deadline"]) if "deadline" in t else datetime.now(),
            priority=t.get("priority", "medium"),
            completed=t.get("completed", False),
        )
        session.add(todo)

    for d in plan.get("documents", []):
        doc = Document(
            request_id=req.id,
            name=d.get("name", ""),
            description=d.get("description", ""),
            required=d.get("required", False),
        )
        session.add(doc)

    for s in plan.get("services", []):
        svc = Service(
            request_id=req.id,
            name=s.get("name", ""),
            description=s.get("description", ""),
            location=s.get("location"),
            link=s.get("link"),
        )
        session.add(svc)

    session.commit()
    session.refresh(req)

    logger.info("Life event request created: id=%s event=%s", req.id, req.life_event)
    return _build_request_read(req, session)


@router.get("/", response_model=list[RequestRead])
def list_events(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """List all life events for the current user."""
    requests = session.exec(
        select(Request).where(Request.user_id == current_user.id).order_by(Request.created_at.desc())
    ).all()

    if not requests:
        return []

    request_ids = [r.id for r in requests]

    # Batch-load all related rows to avoid N+1 queries
    all_todos = session.exec(select(Todo).where(Todo.request_id.in_(request_ids))).all()
    all_docs = session.exec(select(Document).where(Document.request_id.in_(request_ids))).all()
    all_svcs = session.exec(select(Service).where(Service.request_id.in_(request_ids))).all()

    todos_by_req: dict[str, list] = {rid: [] for rid in request_ids}
    docs_by_req: dict[str, list] = {rid: [] for rid in request_ids}
    svcs_by_req: dict[str, list] = {rid: [] for rid in request_ids}

    for t in all_todos:
        todos_by_req[t.request_id].append(t)
    for d in all_docs:
        docs_by_req[d.request_id].append(d)
    for s in all_svcs:
        svcs_by_req[s.request_id].append(s)

    return [
        RequestRead(
            id=r.id,
            user_id=r.user_id,
            life_event=r.life_event,
            description=r.description,
            status=r.status,
            created_at=r.created_at,
            todos=[TodoRead.model_validate(t) for t in todos_by_req[r.id]],
            documents=[DocumentRead.model_validate(d) for d in docs_by_req[r.id]],
            services=[ServiceRead.model_validate(s) for s in svcs_by_req[r.id]],
        )
        for r in requests
    ]


@router.get("/{request_id}", response_model=RequestRead)
def get_event(
    request_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Get a single life event with its tasks, documents, and services."""
    req = session.get(Request, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Барањето не е пронајдено")
    if req.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Немате пристап до ова барање")
    return _build_request_read(req, session)


@router.patch("/{request_id}/status")
def update_event_status(
    request_id: str,
    status_update: dict,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Update the status of a life event."""
    req = session.get(Request, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Барањето не е пронајдено")
    if req.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Немате пристап до ова барање")

    new_status = status_update.get("status")
    if new_status not in ("pending", "completed", "cancelled"):
        raise HTTPException(status_code=400, detail="Невалиден статус")

    req.status = new_status
    session.add(req)
    session.commit()
    logger.info("Request %s status updated to %s", request_id, new_status)
    return {"message": "Статусот е ажуриран", "status": new_status}


@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    request_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Delete a life event and all associated data."""
    req = session.get(Request, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Барањето не е пронајдено")
    if req.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Немате пристап до ова барање")

    for todo in session.exec(select(Todo).where(Todo.request_id == request_id)).all():
        session.delete(todo)
    for doc in session.exec(select(Document).where(Document.request_id == request_id)).all():
        session.delete(doc)
    for svc in session.exec(select(Service).where(Service.request_id == request_id)).all():
        session.delete(svc)

    session.delete(req)
    session.commit()
    logger.info("Request deleted: id=%s by user=%s", request_id, current_user.id)


# ── Helper ───────────────────────────────────────────────
def _build_request_read(req: Request, session: Session) -> RequestRead:
    todos = session.exec(select(Todo).where(Todo.request_id == req.id)).all()
    docs = session.exec(select(Document).where(Document.request_id == req.id)).all()
    svcs = session.exec(select(Service).where(Service.request_id == req.id)).all()

    return RequestRead(
        id=req.id,
        user_id=req.user_id,
        life_event=req.life_event,
        description=req.description,
        status=req.status,
        created_at=req.created_at,
        todos=[TodoRead.model_validate(t) for t in todos],
        documents=[DocumentRead.model_validate(d) for d in docs],
        services=[ServiceRead.model_validate(s) for s in svcs],
    )
