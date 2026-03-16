import os
import shutil
import pandas as pd
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import get_current_user
from models.domain import Project, Dataset, User
from schemas import ProfilingResponse, DatasetResponse

router = APIRouter(
    prefix="/api/datasets",
    tags=["Datasets"]
)

UPLOAD_DIR = "/tmp/dataku_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=ProfilingResponse)
def upload_dataset(
    project_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify project exists and belongs to the current user
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    # Secure filename to prevent path traversal
    safe_filename = os.path.basename(file.filename)
    if not safe_filename:
        safe_filename = "upload.csv"

    # Save file
    file_location = os.path.join(UPLOAD_DIR, f"{project_id}_{safe_filename}")
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)

    file_size = os.path.getsize(file_location)

    # Basic Profiling using Pandas
    try:
        df = pd.read_csv(file_location)
        row_count = len(df)
        column_count = len(df.columns)
        
        # Calculate Missing Values (top 10 columns with missing values)
        missing = df.isnull().sum()
        missing_data = missing[missing > 0].sort_values(ascending=False).head(10)
        missing_values_list = [
            {"column": col, "missing": int(count), "percentage": round(int(count)/row_count * 100, 2)}
            for col, count in missing_data.items()
        ]

        # Calculate Feature Types
        num_count = len(df.select_dtypes(include=['int64', 'float64']).columns)
        bool_count = len(df.select_dtypes(include=['bool']).columns)
        cat_count = column_count - num_count - bool_count

        feature_types_list = [
            {"type": "Numerical", "count": num_count, "fill": "#8884d8"},
            {"type": "Categorical", "count": cat_count, "fill": "#82ca9d"},
            {"type": "Boolean", "count": bool_count, "fill": "#ffc658"}
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse CSV: {str(e)}")

    # Save to database
    db_dataset = Dataset(
        project_id=project_id,
        file_path=file_location,
        original_filename=file.filename,
        row_count=row_count,
        column_count=column_count,
        size_bytes=file_size
    )
    db.add(db_dataset)
    
    # Update project status
    project.status = "profiling"
    
    db.commit()
    db.refresh(db_dataset)

    dataset_resp = DatasetResponse.model_validate(db_dataset)
    return ProfilingResponse(
        dataset=dataset_resp,
        missing_values=missing_values_list,
        feature_types=feature_types_list
    )

@router.get("/{project_id}/profiling", response_model=ProfilingResponse)
def get_dataset_profiling(project_id: str, db: Session = Depends(get_db)):
    """Retrieve profiling data (missing values, feature types) for an existing dataset."""
    dataset = db.query(Dataset).filter(Dataset.project_id == project_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found for this project")

    try:
        df = pd.read_csv(dataset.file_path)
        
        missing = df.isnull().sum()
        missing_data = missing[missing > 0].sort_values(ascending=False).head(10)
        missing_values_list = [
            {"column": col, "missing": int(count), "percentage": round(int(count) / len(df) * 100, 2)}
            for col, count in missing_data.items()
        ]

        num_count = len(df.select_dtypes(include=['int64', 'float64']).columns)
        bool_count = len(df.select_dtypes(include=['bool']).columns)
        cat_count = len(df.columns) - num_count - bool_count

        feature_types_list = [
            {"type": "Numerical", "count": num_count, "fill": "#8884d8"},
            {"type": "Categorical", "count": cat_count, "fill": "#82ca9d"},
            {"type": "Boolean", "count": bool_count, "fill": "#ffc658"}
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to profile dataset: {str(e)}")

    dataset_resp = DatasetResponse.model_validate(dataset)
    return ProfilingResponse(
        dataset=dataset_resp,
        missing_values=missing_values_list,
        feature_types=feature_types_list
    )

@router.get("/{project_id}/preview")
def get_dataset_preview(project_id: str, rows: int = 5, db: Session = Depends(get_db)):
    """Retrieve the first N rows of a dataset as a preview."""
    dataset = db.query(Dataset).filter(Dataset.project_id == project_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found for this project")

    try:
        df = pd.read_csv(dataset.file_path, nrows=rows)
        # Replace NaN with empty string for JSON serialization
        df = df.fillna("")
        return {
            "headers": df.columns.tolist(),
            "rows": df.to_dict(orient="records")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read preview: {str(e)}")

