from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# --- Auth Schemas ---
class UserCreate(BaseModel):
    email: str
    full_name: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None

# --- Project Schemas ---

class ProjectBase(BaseModel):
    name: str

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class DatasetResponse(BaseModel):
    id: int
    project_id: str
    original_filename: str
    row_count: Optional[int]
    column_count: Optional[int]
    size_bytes: Optional[int]
    uploaded_at: datetime

    class Config:
        from_attributes = True

class ProfilingResponse(BaseModel):
    dataset: DatasetResponse
    missing_values: List[dict]
    feature_types: List[dict]

class JobStartRequest(BaseModel):
    target_column: str

class ModelResponse(BaseModel):
    id: int
    project_id: str
    algorithm_name: str
    accuracy_score: Optional[float]
    f1_score: Optional[float]
    training_time_seconds: Optional[int]
    is_deployed: int
    created_at: datetime

    class Config:
        from_attributes = True
