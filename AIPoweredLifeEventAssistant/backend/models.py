
import uuid
from datetime import datetime, timezone
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


# ── Helper ──────────────────────────────────────────────
def utcnow() -> datetime:
    return datetime.now(timezone.utc)


# ── User ────────────────────────────────────────────────
class User(SQLModel, table=True):
    __tablename__ = "users"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    email: str = Field(unique=True, index=True)
    name: str
    password_hash: str
    role: str = Field(default="user")  # "user" | "admin"
    embg: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    created_at: datetime = Field(default_factory=utcnow)

    requests: List["Request"] = Relationship(back_populates="user")


# ── Request (Life Event) ───────────────────────────────
class Request(SQLModel, table=True):
    __tablename__ = "requests"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    life_event: str
    description: Optional[str] = None
    status: str = Field(default="pending")  # "pending" | "completed" | "cancelled"
    options: Optional[str] = None  # JSON-encoded list
    created_at: datetime = Field(default_factory=utcnow)

    user: Optional[User] = Relationship(back_populates="requests")
    todos: List["Todo"] = Relationship(back_populates="request")
    documents: List["Document"] = Relationship(back_populates="request")
    services: List["Service"] = Relationship(back_populates="request")


# ── Todo (Task) ─────────────────────────────────────────
class Todo(SQLModel, table=True):
    __tablename__ = "todos"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    request_id: str = Field(foreign_key="requests.id", index=True)
    text: str
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    priority: str = Field(default="medium")  # "high" | "medium" | "low"
    completed: bool = Field(default=False)

    request: Optional[Request] = Relationship(back_populates="todos")


# ── Document ────────────────────────────────────────────
class Document(SQLModel, table=True):
    __tablename__ = "documents"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    request_id: str = Field(foreign_key="requests.id", index=True)
    name: str
    description: Optional[str] = None
    required: bool = Field(default=True)

    request: Optional[Request] = Relationship(back_populates="documents")


# ── Service ─────────────────────────────────────────────
class Service(SQLModel, table=True):
    __tablename__ = "services"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    request_id: str = Field(foreign_key="requests.id", index=True)
    name: str
    description: Optional[str] = None
    location: Optional[str] = None
    link: Optional[str] = None

    request: Optional[Request] = Relationship(back_populates="services")


# ── Pydantic Schemas ─────────────────────────────────────
class UserCreate(SQLModel):
    email: str
    name: str
    password: str


class UserLogin(SQLModel):
    email: str
    password: str


class UserRead(SQLModel):
    id: str
    email: str
    name: str
    role: str
    embg: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    created_at: datetime


class RequestCreate(SQLModel):
    life_event: str
    description: Optional[str] = None
    options: Optional[list[str]] = None


class TodoRead(SQLModel):
    id: str
    text: str
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    priority: str
    completed: bool


class DocumentRead(SQLModel):
    name: str
    description: Optional[str] = None
    required: bool


class ServiceRead(SQLModel):
    id: str
    name: str
    description: Optional[str] = None
    location: Optional[str] = None
    link: Optional[str] = None


class RequestRead(SQLModel):
    id: str
    user_id: str
    life_event: str
    description: Optional[str] = None
    status: str
    created_at: datetime
    todos: list[TodoRead] = []
    documents: list[DocumentRead] = []
    services: list[ServiceRead] = []


class TokenResponse(SQLModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead
