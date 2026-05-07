from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from database import get_session
from models import User, Request, Todo, TodoRead
from auth import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


@router.patch("/{todo_id}/toggle", response_model=TodoRead)
def toggle_todo(
    todo_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Toggle a task's completed status."""
    todo = session.get(Todo, todo_id)
    if not todo:
        raise HTTPException(status_code=404, detail="Задачата не е пронајдена")

    req = session.get(Request, todo.request_id)
    if not req or (req.user_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(status_code=403, detail="Немате пристап")

    todo.completed = not todo.completed
    session.add(todo)
    session.commit()
    session.refresh(todo)
    return TodoRead.model_validate(todo)


@router.patch("/{todo_id}", response_model=TodoRead)
def update_todo(
    todo_id: str,
    update: dict,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Update a task."""
    todo = session.get(Todo, todo_id)
    if not todo:
        raise HTTPException(status_code=404, detail="Задачата не е пронајдена")

    req = session.get(Request, todo.request_id)
    if not req or (req.user_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(status_code=403, detail="Немате пристап")

    for field in ("text", "description", "priority", "completed"):
        if field in update:
            setattr(todo, field, update[field])

    session.add(todo)
    session.commit()
    session.refresh(todo)
    return TodoRead.model_validate(todo)


@router.delete("/{todo_id}", status_code=204)
def delete_todo(
    todo_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Delete a task."""
    todo = session.get(Todo, todo_id)
    if not todo:
        raise HTTPException(status_code=404, detail="Задачата не е пронајдена")

    req = session.get(Request, todo.request_id)
    if not req or (req.user_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(status_code=403, detail="Немате пристап")

    session.delete(todo)
    session.commit()
