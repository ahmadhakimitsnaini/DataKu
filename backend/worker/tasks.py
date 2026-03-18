import os
import time
import pandas as pd
import joblib
from sqlalchemy.orm import Session
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score

from core.celery_app import celery_app
from core.database import SessionLocal
from models.domain import Project, Dataset, Model

MODEL_DIR = "/tmp/dataku_models"
os.makedirs(MODEL_DIR, exist_ok=True)

@celery_app.task(bind=True)
def train_models_task(self, project_id: str, target_column: str):
    db: Session = SessionLocal()
    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        dataset = db.query(Dataset).filter(Dataset.project_id == project_id).first()

        if not project or not dataset:
            return {"status": "error", "message": "Project or Dataset not found"}

        # 1. Load Data
        df = pd.read_csv(dataset.file_path)
        if target_column not in df.columns:
            return {"status": "error", "message": f"Target column '{target_column}' not found in dataset"}

        # 2. Preprocessing
        # Drop rows where target is missing
        df = df.dropna(subset=[target_column])
        
        y = df[target_column]
        X = df.drop(columns=[target_column])

        # Separate numeric and categorical columns
        numeric_cols = list(X.select_dtypes(include=['int64', 'float64']).columns)
        categorical_cols = list(X.select_dtypes(include=['object', 'bool']).columns)
        feature_names = list(X.columns)
        
        preprocessor = {
            "feature_names": feature_names,
            "numeric_cols": numeric_cols,
            "categorical_cols": categorical_cols,
            "imputer_num": None,
            "imputer_cat": None,
            "label_encoders": {},
            "target_encoder": None,
            "scaler": None
        }

        # Impute missing values
        if len(numeric_cols) > 0:
            imputer_num = SimpleImputer(strategy='mean')
            X[numeric_cols] = imputer_num.fit_transform(X[numeric_cols])
            preprocessor["imputer_num"] = imputer_num
        
        if len(categorical_cols) > 0:
            imputer_cat = SimpleImputer(strategy='most_frequent')
            X[categorical_cols] = imputer_cat.fit_transform(X[categorical_cols])
            preprocessor["imputer_cat"] = imputer_cat
            
            # Encode categorical variables
            for col in categorical_cols:
                le = LabelEncoder()
                X[col] = le.fit_transform(X[col].astype(str))
                preprocessor["label_encoders"][col] = le

        # Encode target if it's categorical
        if y.dtype == 'object' or y.dtype == 'bool':
            le_y = LabelEncoder()
            y = le_y.fit_transform(y.astype(str))
            preprocessor["target_encoder"] = le_y

        # Scale numeric features
        scaler = StandardScaler()
        X = scaler.fit_transform(X)
        preprocessor["scaler"] = scaler
        
        # Save preprocessor
        preprocessor_path = os.path.join(MODEL_DIR, f"{project_id}_preprocessor.pkl")
        joblib.dump(preprocessor, preprocessor_path)

        # 3. Train-Test Split
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # 4. Model Training Definition
        algorithms = {
            "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
            "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
            "Gradient Boosting": GradientBoostingClassifier(n_estimators=100, random_state=42)
        }

        # 5. Training Loop
        for algo_name, model in algorithms.items():
            start_time = time.time()
            model.fit(X_train, y_train)
            end_time = time.time()
            
            y_pred = model.predict(X_test)
            
            # For multi-class classification, use weighted F1
            acc = float(accuracy_score(y_test, y_pred)) * 100
            f1 = float(f1_score(y_test, y_pred, average='weighted')) * 100
            training_time = int(end_time - start_time)
            
            # Save Model Artifact
            model_filename = f"{project_id}_{algo_name.replace(' ', '_').lower()}.pkl"
            model_path = os.path.join(MODEL_DIR, model_filename)
            joblib.dump(model, model_path)
            
            # Save to Database
            db_model = Model(
                project_id=project_id,
                algorithm_name=algo_name,
                accuracy_score=round(acc, 2),
                f1_score=round(f1, 2),
                training_time_seconds=training_time if training_time > 0 else 1
            )
            db.add(db_model)

        # Update Project Status
        project.status = "completed"
        db.commit()

        return {"status": "success", "message": "Models trained successfully"}

    except Exception as e:
        db.rollback()
        project = db.query(Project).filter(Project.id == project_id).first()
        if project:
            project.status = "error"
            db.commit()
        return {"status": "error", "message": str(e)}
    finally:
        db.close()
