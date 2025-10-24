from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import timedelta
from db import get_schedules, create_task, get_tasks, update_task, delete_task
from auth import (
    authenticate_user, create_user, get_current_user, create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

app = FastAPI()

# Allow React frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# Pydantic models
class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class User(BaseModel):
    id: int
    email: str
    name: str
    is_active: bool
    email_verified: bool

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    duration: int  # in minutes
    category: str
    color: str
    is_recurring: bool = False

class TaskCreate(TaskBase):
    pass

class TaskUpdate(TaskBase):
    completed: Optional[bool] = False

class Task(TaskBase):
    id: int
    completed: bool = False

    class Config:
        from_attributes = True

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI backend!"}

# Authentication endpoints
@app.post("/auth/register", response_model=User)
def register_user(user: UserCreate):
    """Register a new user"""
    # Check if user already exists
    from auth import get_user_by_email
    existing_user = get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    new_user = create_user(user.email, user.name, user.password)
    return new_user

@app.post("/auth/login", response_model=Token)
def login_user(user_credentials: UserLogin):
    """Login user and return access token"""
    user = authenticate_user(user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user["id"])}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=User)
def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@app.get("/schedules")
def read_schedules():
    return get_schedules()

# Task CRUD endpoints (now user-specific)
@app.get("/tasks", response_model=List[Task])
def get_tasks_endpoint(current_user: dict = Depends(get_current_user)):
    return get_tasks(current_user["id"])

@app.post("/tasks", response_model=Task)
def create_task_endpoint(task: TaskCreate, current_user: dict = Depends(get_current_user)):
    return create_task(task, current_user["id"])

@app.put("/tasks/{task_id}", response_model=Task)
def update_task_endpoint(task_id: int, task: TaskUpdate, current_user: dict = Depends(get_current_user)):
    return update_task(task_id, task, current_user["id"])

@app.delete("/tasks/{task_id}")
def delete_task_endpoint(task_id: int, current_user: dict = Depends(get_current_user)):
    return delete_task(task_id, current_user["id"])
