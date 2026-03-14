from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

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
