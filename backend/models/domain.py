import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    status = Column(String, default="idle") # idle, profiling, training, completed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Relationships
    datasets = relationship("Dataset", back_populates="project")
    models = relationship("Model", back_populates="project")

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.id"))
    file_path = Column(String)
    original_filename = Column(String)
    row_count = Column(Integer, nullable=True)
    column_count = Column(Integer, nullable=True)
    size_bytes = Column(Integer, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="datasets")

class Model(Base):
    __tablename__ = "models"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.id"))
    algorithm_name = Column(String)
    accuracy_score = Column(Float, nullable=True)
    f1_score = Column(Float, nullable=True)
    training_time_seconds = Column(Integer, nullable=True)
    is_deployed = Column(Integer, default=0) # 0 False, 1 True
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="models")
