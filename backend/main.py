"""
FastAPI backend for HCP Interaction Logger.
Provides REST API endpoints and AI chat integration via LangGraph.
"""

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import os

from dotenv import load_dotenv
load_dotenv()

from database import get_db, engine, Base
from models import HCP, Material, Sample, Interaction, InteractionSample, ChatMessage
from schemas import (
    HCPOut, HCPCreate, MaterialOut, SampleOut,
    InteractionCreate, InteractionOut,
    ChatRequest, ChatResponse,
)
from agent import run_agent

# Create tables
Base.metadata.create_all(bind=engine)

# Seed data on startup
from seed_data import seed
seed()

app = FastAPI(title="HCP Interaction Logger API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────── HCP Endpoints ────────────────

@app.get("/api/hcps", response_model=List[HCPOut])
def search_hcps(q: str = Query("", min_length=0), db: Session = Depends(get_db)):
    query = db.query(HCP)
    if q:
        query = query.filter(HCP.name.ilike(f"%{q}%"))
    return query.limit(20).all()


@app.get("/api/hcps/{hcp_id}", response_model=HCPOut)
def get_hcp(hcp_id: int, db: Session = Depends(get_db)):
    hcp = db.query(HCP).filter(HCP.id == hcp_id).first()
    if not hcp:
        raise HTTPException(status_code=404, detail="HCP not found")
    return hcp


# ──────────────── Material Endpoints ────────────────

@app.get("/api/materials", response_model=List[MaterialOut])
def search_materials(q: str = Query("", min_length=0), db: Session = Depends(get_db)):
    query = db.query(Material)
    if q:
        query = query.filter(Material.name.ilike(f"%{q}%"))
    return query.limit(20).all()


# ──────────────── Sample Endpoints ────────────────

@app.get("/api/samples", response_model=List[SampleOut])
def search_samples(q: str = Query("", min_length=0), db: Session = Depends(get_db)):
    query = db.query(Sample)
    if q:
        query = query.filter(Sample.name.ilike(f"%{q}%"))
    return query.limit(20).all()


# ──────────────── Interaction Endpoints ────────────────

@app.post("/api/interactions", response_model=InteractionOut)
def create_interaction(data: InteractionCreate, db: Session = Depends(get_db)):
    # If hcp_name is provided but no hcp_id, try to find or create
    hcp_id = data.hcp_id
    if not hcp_id and data.hcp_name:
        hcp = db.query(HCP).filter(HCP.name.ilike(f"%{data.hcp_name}%")).first()
        if hcp:
            hcp_id = hcp.id
        else:
            new_hcp = HCP(name=data.hcp_name)
            db.add(new_hcp)
            db.flush()
            hcp_id = new_hcp.id

    interaction = Interaction(
        hcp_id=hcp_id,
        interaction_type=data.interaction_type,
        date=data.date,
        time=data.time,
        attendees=data.attendees,
        topics=data.topics,
        sentiment=data.sentiment,
        outcomes=data.outcomes,
        follow_up=data.follow_up,
        notes=data.notes,
    )
    db.add(interaction)
    db.flush()

    # Add materials
    if data.material_ids:
        mats = db.query(Material).filter(Material.id.in_(data.material_ids)).all()
        interaction.materials = mats

    # Add samples
    if data.sample_entries:
        for entry in data.sample_entries:
            isample = InteractionSample(
                interaction_id=interaction.id,
                sample_id=entry["sample_id"],
                quantity=entry.get("quantity", 1),
            )
            db.add(isample)

    db.commit()
    db.refresh(interaction)
    return interaction


@app.get("/api/interactions", response_model=List[InteractionOut])
def list_interactions(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(Interaction).order_by(Interaction.created_at.desc()).offset(skip).limit(limit).all()


@app.get("/api/interactions/{interaction_id}", response_model=InteractionOut)
def get_interaction(interaction_id: int, db: Session = Depends(get_db)):
    interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return interaction


# ──────────────── Chat / AI Agent Endpoint ────────────────

@app.post("/api/chat", response_model=ChatResponse)
def chat_with_agent(req: ChatRequest, db: Session = Depends(get_db)):
    # Fetch chat history for this session
    history_records = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == req.session_id)
        .order_by(ChatMessage.timestamp)
        .limit(20)
        .all()
    )
    chat_history = [{"role": r.role, "content": r.content} for r in history_records]

    # Run the LangGraph agent
    result = run_agent(req.message, chat_history)

    # Save user message
    user_msg = ChatMessage(
        session_id=req.session_id,
        role="user",
        content=req.message,
    )
    db.add(user_msg)

    # Save assistant message
    assistant_msg = ChatMessage(
        session_id=req.session_id,
        role="assistant",
        content=result["response"],
        extracted_data=json.dumps(result.get("extracted_data", {})),
    )
    db.add(assistant_msg)
    db.commit()

    return ChatResponse(
        response=result["response"],
        extracted_data=result.get("extracted_data"),
        session_id=req.session_id,
    )


# ──────────────── Health Check ────────────────

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "HCP Interaction Logger API is running"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
