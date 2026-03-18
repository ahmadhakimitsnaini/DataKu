from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from core.security import get_current_user
from models.domain import Project, Model, User
from schemas import JobStartRequest, ModelResponse
from worker.tasks import train_models_task

router = APIRouter(
    prefix="/api/jobs",
    tags=["Jobs & Models"]
)

@router.post("/{project_id}/train")
def start_training_job(
    project_id: str,
    payload: JobStartRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.status == "training":
        raise HTTPException(status_code=400, detail="A training job is already running for this project")

    project.status = "training"
    db.commit()

    task = train_models_task.delay(project_id, payload.target_column)
    return {
        "message": "Training job started successfully",
        "task_id": task.id,
        "project_id": project_id,
        "status": "training"
    }

@router.get("/{project_id}/models", response_model=List[ModelResponse])
def get_project_models(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    models = db.query(Model).filter(Model.project_id == project_id).order_by(Model.accuracy_score.desc()).all()
    return models

@router.put("/{project_id}/models/{model_id}/deploy")
def deploy_model(
    project_id: str,
    model_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    target_model = db.query(Model).filter(
        Model.id == model_id,
        Model.project_id == project_id
    ).first()
    
    if not target_model:
        raise HTTPException(status_code=404, detail="Model not found")

    # Set all other models in project to not deployed
    db.query(Model).filter(Model.project_id == project_id).update({"is_deployed": 0})
    
    # Set target model to deployed
    target_model.is_deployed = 1
    db.commit()

    return {"message": f"Model {model_id} successfully deployed"}
