import uuid
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


def new_id() -> str:
    return uuid.uuid4().hex[:16]


class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    accent_color: str = "ocean_blue"
    theme_mode: str = "light"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ThemeUpdate(BaseModel):
    accent_color: Optional[str] = None
    theme_mode: Optional[str] = None


class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=new_id)
    user_id: str
    name: str
    type: str  # income | expense
    icon: str = "Circle"
    color: str = "slate"
    is_default: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CategoryCreate(BaseModel):
    name: str
    type: str
    icon: str = "Circle"
    color: str = "slate"


class Transaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=new_id)
    user_id: str
    type: str  # income | expense
    amount: float
    category_id: str
    category_name: str
    category_icon: str = "Circle"
    category_color: str = "slate"
    date: str  # YYYY-MM-DD
    description: str = ""
    payment_method: str = "cash"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class TransactionCreate(BaseModel):
    type: str
    amount: float
    category_id: str
    date: str
    description: str = ""
    payment_method: str = "cash"


class TransactionUpdate(BaseModel):
    type: Optional[str] = None
    amount: Optional[float] = None
    category_id: Optional[str] = None
    date: Optional[str] = None
    description: Optional[str] = None
    payment_method: Optional[str] = None
