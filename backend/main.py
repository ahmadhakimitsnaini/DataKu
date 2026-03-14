from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.database import engine, Base
from api import projects, upload

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DataKu API",
    description="Backend API for DataKu AutoML Platform",
    version="1.0.0"
)

# CORS configuration to allow React frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router)
app.include_router(upload.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to DataKu API. Visit /docs for documentation."}

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "DataKu Core API"}
