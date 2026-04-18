from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.database import engine, Base
from api import projects, upload, jobs, auth, predict

# --- DATABASE INITIALIZATION ---
# Base.metadata.create_all akan secara otomatis membuat tabel di database 
# berdasarkan model-model SQLAlchemy yang sudah didefinisikan jika belum ada.
Base.metadata.create_all(bind=engine)

# --- FASTAPI APP INSTANCE ---
app = FastAPI(
    title="DataKu API",
    description="Backend API for DataKu AutoML Platform",
    version="1.0.0",
    redirect_slashes=False # Mencegah pengalihan otomatis jika ada trailing slash (/)
)

# --- CORS (Cross-Origin Resource Sharing) ---
# Mengizinkan frontend (React/Vite) yang berjalan di port berbeda untuk 
# melakukan permintaan (request) ke API ini.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", # Default Vite
        "http://localhost:3000", # Default React App
        "http://localhost:8082", 
        "http://localhost:8080"
    ],
    allow_credentials=True,
    allow_methods=["*"], # Mengizinkan semua metode (GET, POST, PUT, DELETE, dll)
    allow_headers=["*"], # Mengizinkan semua header
)

# --- ROUTER REGISTRATION ---
# Menghubungkan modul-modul API yang terpisah ke dalam aplikasi utama.
app.include_router(auth.router)      # Autentikasi & JWT
app.include_router(projects.router)  # Manajemen Proyek
app.include_router(upload.router)    # Upload & Profiling Dataset
app.include_router(jobs.router)      # Training Model (Celery Integration)
app.include_router(predict.router)   # Inference/Prediksi Model

# --- BASIC ENDPOINTS ---

@app.get("/")
def read_root():
    """Endpoint utama untuk mengecek apakah API berjalan."""
    return {"message": "Welcome to DataKu API. Visit /docs for documentation."}

@app.get("/api/health")
def health_check():
    """Health check untuk monitoring status layanan backend."""
    return {"status": "ok", "service": "DataKu Core API"}