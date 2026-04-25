from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ---------- HCP ----------
class HCPBase(BaseModel):
    name: str
    specialty: Optional[str] = None
    hospital: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None


class HCPCreate(HCPBase):
    pass


class HCPOut(HCPBase):
    id: int

    class Config:
        from_attributes = True


# ---------- Material ----------
class MaterialOut(BaseModel):
    id: int
    name: str
    type: Optional[str] = None

    class Config:
        from_attributes = True


# ---------- Sample ----------
class SampleOut(BaseModel):
    id: int
    name: str
    product: Optional[str] = None

    class Config:
        from_attributes = True


# ---------- InteractionSample ----------
class InteractionSampleOut(BaseModel):
    id: int
    sample_id: int
    quantity: int
    sample: Optional[SampleOut] = None

    class Config:
        from_attributes = True


# ---------- Interaction ----------
class InteractionCreate(BaseModel):
    hcp_id: Optional[int] = None
    hcp_name: Optional[str] = None
    interaction_type: str = "Meeting"
    date: Optional[str] = None
    time: Optional[str] = None
    attendees: Optional[str] = None
    topics: Optional[str] = None
    sentiment: Optional[str] = None
    outcomes: Optional[str] = None
    follow_up: Optional[str] = None
    notes: Optional[str] = None
    material_ids: Optional[List[int]] = []
    sample_entries: Optional[List[dict]] = []


class InteractionOut(BaseModel):
    id: int
    hcp_id: Optional[int] = None
    interaction_type: str
    date: Optional[str] = None
    time: Optional[str] = None
    attendees: Optional[str] = None
    topics: Optional[str] = None
    sentiment: Optional[str] = None
    outcomes: Optional[str] = None
    follow_up: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    hcp: Optional[HCPOut] = None
    materials: Optional[List[MaterialOut]] = []
    distributed_samples: Optional[List[InteractionSampleOut]] = []

    class Config:
        from_attributes = True


# ---------- Chat ----------
class ChatRequest(BaseModel):
    session_id: str
    message: str
    current_form_data: Optional[dict] = None


class ChatResponse(BaseModel):
    response: str
    extracted_data: Optional[dict] = None
    session_id: str
