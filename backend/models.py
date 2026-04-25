from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


interaction_materials = Table(
    "interaction_materials",
    Base.metadata,
    Column("interaction_id", Integer, ForeignKey("interactions.id"), primary_key=True),
    Column("material_id", Integer, ForeignKey("materials.id"), primary_key=True),
)


class HCP(Base):
    __tablename__ = "hcps"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    specialty = Column(String(255))
    hospital = Column(String(255))
    email = Column(String(255))
    phone = Column(String(50))

    interactions = relationship("Interaction", back_populates="hcp")


class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    type = Column(String(100))


class Sample(Base):
    __tablename__ = "samples"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    product = Column(String(255))


class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    hcp_id = Column(Integer, ForeignKey("hcps.id"), nullable=True)
    interaction_type = Column(String(50), default="Meeting")
    date = Column(String(20))
    time = Column(String(20))
    attendees = Column(Text)
    topics = Column(Text)
    sentiment = Column(String(20))
    outcomes = Column(Text)
    follow_up = Column(Text)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    hcp = relationship("HCP", back_populates="interactions")
    materials = relationship("Material", secondary=interaction_materials)
    distributed_samples = relationship("InteractionSample", back_populates="interaction", cascade="all, delete-orphan")


class InteractionSample(Base):
    __tablename__ = "interaction_samples"

    id = Column(Integer, primary_key=True, index=True)
    interaction_id = Column(Integer, ForeignKey("interactions.id"))
    sample_id = Column(Integer, ForeignKey("samples.id"))
    quantity = Column(Integer, default=1)

    interaction = relationship("Interaction", back_populates="distributed_samples")
    sample = relationship("Sample")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), index=True)
    role = Column(String(20))
    content = Column(Text)
    extracted_data = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
