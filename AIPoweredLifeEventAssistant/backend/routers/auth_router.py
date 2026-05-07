from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from database import get_session
from models import User, UserCreate, UserLogin, UserRead, TokenResponse
from auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, session: Session = Depends(get_session)):
    """Register a new user and return an access token."""
    existing = session.exec(select(User).where(User.email == data.email)).first()
    if existing:
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

    token = create_access_token({"sub": user.id})
    return TokenResponse(
        access_token=token,
        user=UserRead.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, session: Session = Depends(get_session)):
    """Authenticate a user and return an access token."""
    user = session.exec(select(User).where(User.email == data.email)).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Невалидна е-пошта или лозинка",
        )

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
    return UserRead.model_validate(current_user)
