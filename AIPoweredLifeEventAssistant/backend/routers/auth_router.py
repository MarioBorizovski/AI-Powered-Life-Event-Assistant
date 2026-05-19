import time
import logging
from collections import defaultdict
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlmodel import Session, select

from database import get_session
from models import User, UserCreate, UserLogin, UserRead, TokenResponse
from auth import hash_password, verify_password, create_access_token, get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# ── Login rate limiter (5 attempts / 60s per IP) ─────────
_login_store: dict[str, list[float]] = defaultdict(list)
LOGIN_RATE_LIMIT = 5
LOGIN_RATE_WINDOW = 60.0


def _check_login_rate(ip: str) -> bool:
    now = time.time()
    window_start = now - LOGIN_RATE_WINDOW
    _login_store[ip] = [t for t in _login_store[ip] if t > window_start]
    if len(_login_store[ip]) >= LOGIN_RATE_LIMIT:
        return False
    _login_store[ip].append(now)
    return True


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, session: Session = Depends(get_session)):
    """Register a new user and return an access token."""
    existing = session.exec(select(User).where(User.email == data.email)).first()
    if existing:
        logger.warning("Register failed — email already exists: %s", data.email[:3] + "***")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Корисник со оваа е-пошта веќе постои",
        )

    user = User(
        email=data.email,
        name=data.name,
        password_hash=hash_password(data.password),
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    logger.info("New user registered: id=%s", user.id)
    token = create_access_token({"sub": user.id})
    return TokenResponse(
        access_token=token,
        user=UserRead.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, request: Request, session: Session = Depends(get_session)):
    """Authenticate a user and return an access token."""
    client_ip = request.client.host if request.client else "unknown"

    if not _check_login_rate(client_ip):
        logger.warning("Login rate limit exceeded for IP: %s", client_ip)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Премногу обиди за најава. Обидете се повторно за 1 минута.",
        )

    user = session.exec(select(User).where(User.email == data.email)).first()
    if not user or not verify_password(data.password, user.password_hash):
        logger.warning("Login failed for email: %s from IP: %s", data.email[:3] + "***", client_ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Невалидна е-пошта или лозинка",
        )

    logger.info("User logged in: id=%s", user.id)
    token = create_access_token({"sub": user.id})
    return TokenResponse(
        access_token=token,
        user=UserRead.model_validate(user),
    )


@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user."""
    return UserRead.model_validate(current_user)


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    embg: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None


@router.patch("/me", response_model=UserRead)
def update_me(
    data: UserUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Update the currently authenticated user's profile."""
    if data.email and data.email != current_user.email:
        existing = session.exec(select(User).where(User.email == data.email)).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Корисник со оваа е-пошта веќе постои",
            )
        current_user.email = data.email

    if data.name is not None:
        current_user.name = data.name
    if data.password:
        current_user.password_hash = hash_password(data.password)
    if data.embg is not None:
        current_user.embg = data.embg
    if data.phone_number is not None:
        current_user.phone_number = data.phone_number
    if data.address is not None:
        current_user.address = data.address
    if data.city is not None:
        current_user.city = data.city

    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    logger.info("Profile updated for user: id=%s", current_user.id)
    return UserRead.model_validate(current_user)
