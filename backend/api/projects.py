import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from core.security import get_current_user
from models.domain import Project, User
from schemas import ProjectCreate, ProjectResponse

router = APIRouter(
    prefix="/api/projects",
    tags=["Projects"]
)

@router.post("", response_model=ProjectResponse)
def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project_id = str(uuid.uuid4())
    db_project = Project(id=project_id, name=project.name, status="idle", owner_id=current_user.id)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.get("", response_model=List[ProjectResponse])
def get_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Only return projects belonging to the current user
    return db.query(Project).filter(
        Project.owner_id == current_user.id
    ).order_by(Project.created_at.desc()).all()

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete a project and all associated datasets and models."""
    from models.domain import Dataset, Model
    import os

    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Delete associated dataset files from disk
    datasets = db.query(Dataset).filter(Dataset.project_id == project_id).all()
    for dataset in datasets:
        if dataset.file_path and os.path.exists(dataset.file_path):
            try:
                os.remove(dataset.file_path)
            except OSError:
                pass

    # Delete model artifact files from disk
    models = db.query(Model).filter(Model.project_id == project_id).all()
    for model in models:
        if hasattr(model, 'artifact_path') and model.artifact_path and os.path.exists(model.artifact_path):
            try:
                os.remove(model.artifact_path)
            except OSError:
                pass

    db.query(Model).filter(Model.project_id == project_id).delete()
    db.query(Dataset).filter(Dataset.project_id == project_id).delete()
    db.delete(project)
    db.commit()
    return

@router.get("/{project_id}/columns")
def get_project_columns(project_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from models.domain import Dataset
    import pandas as pd

    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    dataset = db.query(Dataset).filter(Dataset.project_id == project_id).first()
    if not dataset or not dataset.file_path:
        raise HTTPException(status_code=404, detail="Dataset not found or not uploaded yet")

    try:
        df = pd.read_csv(dataset.file_path, nrows=0)
        return {"columns": df.columns.tolist()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read dataset columns: {str(e)}")
