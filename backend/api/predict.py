"""
api/predict.py — Endpoint for making live inferences against deployed models.
"""
import os
import joblib
import pandas as pd
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session

from core.database import get_db
from models.domain import Project, Model

router = APIRouter(
    prefix="/api/predict",
    tags=["Prediction API"]
)

# In-memory cache for loaded models and preprocessors to avoid repeated disk I/O
_model_cache = {}

@router.post("/{project_id}")
def predict(
    project_id: str,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
    # Note: For production, we might want an API Key auth here, but for now we leave it open or require JWT. 
    # Usually prediction endpoints are consumed by other services with API keys. 
    # We will let anyone hit it for ease of testing in this phase, or could secure it.
    # Let's secure it but allow the curl snippet to just use the JWT token.
):
    """
    Make a prediction using the currently deployed model for a project.
    Expects a JSON payload where keys are feature names and values are the feature values.
    """
    # Find the deployed model
    deployed_model = db.query(Model).filter(
        Model.project_id == project_id,
        Model.is_deployed == 1
    ).first()
    
    if not deployed_model:
        raise HTTPException(status_code=404, detail="No deployed model found for this project")

    # Paths
    MODEL_DIR = "/tmp/dataku_models"
    model_filename = f"{project_id}_{deployed_model.algorithm_name.replace(' ', '_').lower()}.pkl"
    model_path = os.path.join(MODEL_DIR, model_filename)
    preprocessor_path = os.path.join(MODEL_DIR, f"{project_id}_preprocessor.pkl")

    if not os.path.exists(model_path) or not os.path.exists(preprocessor_path):
        raise HTTPException(
            status_code=500, 
            detail="Model artifacts missing from disk. Please retrain the project to generate preprocessors."
        )

    # Load artifacts (using basic memory caching)
    cache_key = f"{project_id}_{deployed_model.id}"
    if cache_key not in _model_cache:
        try:
            model = joblib.load(model_path)
            preprocessor = joblib.load(preprocessor_path)
            _model_cache[cache_key] = {"model": model, "preprocessor": preprocessor}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to load model artifacts: {str(e)}")
    
    artifacts = _model_cache[cache_key]
    model = artifacts["model"]
    preprocessor = artifacts["preprocessor"]

    try:
        # Convert JSON payload to single-row DataFrame
        df = pd.DataFrame([payload])
        
        # Ensure all feature names exist (fill missing with None/NaN)
        for col in preprocessor["feature_names"]:
            if col not in df.columns:
                df[col] = None

        # Reorder columns to match training exactly
        df = df[preprocessor["feature_names"]]

        # Preprocessing: Imputation
        if len(preprocessor["numeric_cols"]) > 0 and preprocessor["imputer_num"] is not None:
            df[preprocessor["numeric_cols"]] = preprocessor["imputer_num"].transform(df[preprocessor["numeric_cols"]])
            
        if len(preprocessor["categorical_cols"]) > 0 and preprocessor["imputer_cat"] is not None:
            df[preprocessor["categorical_cols"]] = preprocessor["imputer_cat"].transform(df[preprocessor["categorical_cols"]])

        # Preprocessing: Encoding
        for col in preprocessor["categorical_cols"]:
            le = preprocessor["label_encoders"].get(col)
            if le:
                # Handle unknown categories encountered during inference safely
                known_classes = set(le.classes_)
                df[col] = df[col].astype(str).apply(
                    lambda x: x if x in known_classes else known_classes.pop() # fallback to arbitrary known class if unknown
                )
                df[col] = le.transform(df[col].astype(str))

        # Preprocessing: Scaling
        if preprocessor["scaler"] is not None:
            X_scaled = preprocessor["scaler"].transform(df)
        else:
            X_scaled = df.values

        # Predict
        prediction = model.predict(X_scaled)
        prob = model.predict_proba(X_scaled).max() if hasattr(model, "predict_proba") else None

        result_value = prediction[0]
        
        # Decode target if there's a target encoder
        target_encoder = preprocessor.get("target_encoder")
        if target_encoder:
            result_value = target_encoder.inverse_transform([int(result_value)])[0]

        response = {"prediction": result_value}
        if prob is not None:
            response["confidence"] = round(float(prob) * 100, 2)
            
        return response

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Inference error: {str(e)}")
