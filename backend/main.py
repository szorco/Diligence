from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from db import get_schedules, create_task, get_tasks, update_task, delete_task

app = FastAPI()

# Allow React frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# Pydantic models
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

@app.get("/schedules")
def read_schedules():
    return get_schedules()

# Task CRUD endpoints
@app.get("/tasks", response_model=List[Task])
def get_tasks_endpoint():
    return get_tasks()

@app.post("/tasks", response_model=Task)
def create_task_endpoint(task: TaskCreate):
    return create_task(task)

@app.put("/tasks/{task_id}", response_model=Task)
def update_task_endpoint(task_id: int, task: TaskUpdate):
    return update_task(task_id, task)

@app.delete("/tasks/{task_id}")
def delete_task_endpoint(task_id: int):
    return delete_task(task_id)
