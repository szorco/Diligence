from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import get_schedules

app = FastAPI()

# Allow React frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI backend!"}

@app.get("/schedules")
def read_schedules():
    return get_schedules()
