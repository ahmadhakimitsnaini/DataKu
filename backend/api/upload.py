import os
import shutil
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from core.database import get_db
from models.domain import Project, Dataset
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
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    file_location = os.path.join(UPLOAD_DIR, f"{project_id}_{file.filename}")
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)

    file_size = os.path.getsize(file_location)

    try:
        df = pd.read_csv(file_location)
        row_count = len(df)
        column_count = len(df.columns)

        missing = df.isnull().sum()
        missing_data = missing[missing > 0].sort_values(ascending=False).head(10)
        missing_values_list = [
            {"column": col, "missing": int(count), "percentage": round(int(count)/row_count * 100, 2)}
            for col, count in missing_data.items()
        ]

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

    db_dataset = Dataset(
        project_id=project_id,
        file_path=file_location,
        original_filename=file.filename,
        row_count=row_count,
        column_count=column_count,
        size_bytes=file_size
    )
    db.add(db_dataset)
    project.status = "profiling"
    db.commit()
    db.refresh(db_dataset)

    dataset_resp = DatasetResponse.model_validate(db_dataset)
    return ProfilingResponse(
        dataset=dataset_resp,
        missing_values=missing_values_list,
        feature_types=feature_types_list
    )
