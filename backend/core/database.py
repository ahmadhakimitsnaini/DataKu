import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Menggunakan SQLite untuk prototyping lokal agar mudah (Bisa diganti PostgreSQL nanti)
DATABASE_URL = "sqlite:///./dataku.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency untuk mendapatkan koneksi database per-request di FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
