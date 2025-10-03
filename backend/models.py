# models.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class UserBase(BaseModel):
    name: str
    username: str
    privilege: str
    user_type: Optional[str] = None
    table: Optional[str] = None

class UserCreate(BaseModel):
    name: str
    username: str
    password: str
    privilege: str
    user_type: Optional[str] = None
    table: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class UserInDB(UserBase):
    hashed_password: str
    date_created: datetime
    date_last_login: datetime = None
    enable: bool
    token_expiry: datetime = None

class Token(BaseModel):
    access_token: str
    token_type: str

class MenuItem(BaseModel):
    id: Optional[str] = None
    name: str
    description: str
    price: float
    category: str
    image_url: Optional[str] = None
    is_available: bool = True

class MenuCategory(BaseModel):
    name: str
    items: List[MenuItem] = []
    
