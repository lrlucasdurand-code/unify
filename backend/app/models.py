from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship, JSON
from pydantic import EmailStr
import datetime

# --- Shared Properties ---

class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True)
    full_name: Optional[str] = None
    is_active: bool = True
    is_superuser: bool = False

class OrganizationBase(SQLModel):
    name: str

class IntegrationBase(SQLModel):
    provider: str # "meta", "google", "snap", "tiktok"
    is_enabled: bool = False
    credentials: Optional[dict] = Field(default=None, sa_type=JSON) 

# --- Database Models ---

class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str
    organization_id: Optional[int] = Field(default=None, foreign_key="organization.id")
    role: str = Field(default="user")

    organization: Optional["Organization"] = Relationship(back_populates="users")

class Organization(OrganizationBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
    users: List["User"] = Relationship(back_populates="organization")
    integrations: List["Integration"] = Relationship(back_populates="organization")
    
    # Store global settings here or in a separate table?
    # For MVP, let's store basics here
    google_sheet_id: Optional[str] = None
    drive_folder_id: Optional[str] = None
    plan: str = Field(default="free")
    stripe_customer_id: Optional[str] = None

class Integration(IntegrationBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    organization_id: Optional[int] = Field(default=None, foreign_key="organization.id")
    
    organization: Optional["Organization"] = Relationship(back_populates="integrations")

# --- Schemas (Pydantic models for API) ---

class UserCreate(UserBase):
    password: str
    organization_name: str

class UserRead(UserBase):
    id: int
    organization_id: Optional[int]

class Token(SQLModel):
    access_token: str
    token_type: str

class TokenData(SQLModel):
    email: Optional[str] = None
