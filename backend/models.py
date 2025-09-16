from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    username: str  
    password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    instances: List['WhatsAppInstance'] = Field(default_factory=list)

class WhatsAppInstance(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    status: str = "pending"  # pending, active, offline
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_access: Optional[datetime] = None
    metrics: Dict[str, Any] = Field(default_factory=lambda: {"today": 0, "groups": 0})

class Message(BaseModel):
    from_user: str  # 'me' or contact name
    text: str
    time: str
    status: str = "sent"

class Conversation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    instance_id: str
    name: str
    phone: Optional[str] = None
    unread: int = 0
    messages: List[Message] = Field(default_factory=list)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Campaign(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    message: str
    status: str = "draft"  # draft, active, completed, paused
    instance_id: str
    target_groups: List[str] = Field(default_factory=list)
    scheduled_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    name: str
    username: str
    password: str

class InstanceCreate(BaseModel):
    name: str
    phone: str

class ConversationCreate(BaseModel):
    instance_id: str
    name: str
    phone: Optional[str] = None

class MessageCreate(BaseModel):
    conversation_id: str
    text: str

class CampaignCreate(BaseModel):
    name: str
    message: str
    instance_id: str
    target_groups: List[str] = Field(default_factory=list)
    scheduled_at: Optional[datetime] = None