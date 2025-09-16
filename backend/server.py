from fastapi import FastAPI, HTTPException, APIRouter, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from starlette.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
import os
import logging
from pathlib import Path
from datetime import datetime

from .models import (
    User, WhatsAppInstance, Conversation, Message, Campaign,
    UserCreate, InstanceCreate, ConversationCreate, MessageCreate, CampaignCreate
)
from .database import db

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create the main app
app = FastAPI(title="WhatsApp Bot Management System", version="1.0.0")

# Create API router
api_router = APIRouter(prefix="/api")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === USER ROUTES ===

@api_router.post("/users", response_model=User)
async def create_user(user_data: UserCreate):
    """Create a new user"""
    # Check if username already exists
    existing_user = db.get_user_by_username(user_data.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    user = User(**user_data.model_dump())
    return db.create_user(user)

@api_router.get("/users", response_model=List[User])
async def get_users():
    """Get all users"""
    return db.get_all_users()

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    """Get user by ID"""
    user = db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@api_router.put("/users/{user_id}", response_model=User)
async def update_user(user_id: str, user_data: UserCreate):
    """Update user"""
    user = db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check username conflict
    if user_data.username != user.username:
        existing = db.get_user_by_username(user_data.username)
        if existing:
            raise HTTPException(status_code=400, detail="Username already exists")
    
    user.name = user_data.name
    user.username = user_data.username
    user.password = user_data.password
    return db.update_user(user)

@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str):
    """Delete user"""
    if not db.delete_user(user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

# === AUTHENTICATION ===

@api_router.post("/auth/login")
async def login(credentials: dict):
    """Simple login"""
    username = credentials.get("username")
    password = credentials.get("password")
    
    user = db.get_user_by_username(username)
    if not user or user.password != password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {"user": user, "token": f"fake_token_{user.id}"}

# === WHATSAPP INSTANCE ROUTES ===

@api_router.post("/users/{user_id}/instances", response_model=WhatsAppInstance)
async def create_instance(user_id: str, instance_data: InstanceCreate):
    """Create new WhatsApp instance for user"""
    user = db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    instance = WhatsAppInstance(**instance_data.model_dump())
    if db.add_instance_to_user(user_id, instance):
        return instance
    raise HTTPException(status_code=500, detail="Failed to create instance")

@api_router.get("/users/{user_id}/instances", response_model=List[WhatsAppInstance])
async def get_user_instances(user_id: str):
    """Get all instances for user"""
    user = db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user.instances

@api_router.put("/users/{user_id}/instances/{instance_id}", response_model=WhatsAppInstance)
async def update_instance(user_id: str, instance_id: str, instance_data: InstanceCreate):
    """Update WhatsApp instance"""
    user = db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    instance = None
    for inst in user.instances:
        if inst.id == instance_id:
            instance = inst
            break
    
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    
    instance.name = instance_data.name
    instance.phone = instance_data.phone
    
    if db.update_instance(user_id, instance):
        return instance
    raise HTTPException(status_code=500, detail="Failed to update instance")

@api_router.post("/users/{user_id}/instances/{instance_id}/reconnect")
async def reconnect_instance(user_id: str, instance_id: str):
    """Reconnect WhatsApp instance"""
    user = db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    for instance in user.instances:
        if instance.id == instance_id:
            instance.status = "active"
            instance.last_access = datetime.utcnow()
            db.update_instance(user_id, instance)
            return {"message": "Instance reconnected successfully"}
    
    raise HTTPException(status_code=404, detail="Instance not found")

@api_router.post("/users/{user_id}/instances/{instance_id}/disconnect")
async def disconnect_instance(user_id: str, instance_id: str):
    """Disconnect WhatsApp instance"""
    user = db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    for instance in user.instances:
        if instance.id == instance_id:
            instance.status = "offline"
            db.update_instance(user_id, instance)
            return {"message": "Instance disconnected successfully"}
    
    raise HTTPException(status_code=404, detail="Instance not found")

@api_router.delete("/users/{user_id}/instances/{instance_id}")
async def delete_instance(user_id: str, instance_id: str):
    """Delete WhatsApp instance"""
    if not db.remove_instance(user_id, instance_id):
        raise HTTPException(status_code=404, detail="Instance not found")
    return {"message": "Instance deleted successfully"}

# === CONVERSATION ROUTES ===

@api_router.get("/users/{user_id}/conversations", response_model=List[Conversation])
async def get_conversations(user_id: str):
    """Get all conversations for user"""
    return db.get_user_conversations(user_id)

@api_router.post("/users/{user_id}/conversations", response_model=Conversation)
async def create_conversation(user_id: str, conv_data: ConversationCreate):
    """Create new conversation"""
    conversation = Conversation(**conv_data.model_dump())
    return db.add_conversation(user_id, conversation)

@api_router.post("/users/{user_id}/conversations/{conversation_id}/messages")
async def send_message(user_id: str, conversation_id: str, message_data: dict):
    """Send message in conversation"""
    conversations = db.get_user_conversations(user_id)
    conversation = None
    for conv in conversations:
        if conv.id == conversation_id:
            conversation = conv
            break
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    message = Message(
        from_user="me",
        text=message_data["text"],
        time=datetime.now().strftime("%H:%M")
    )
    
    conversation.messages.append(message)
    conversation.updated_at = datetime.utcnow()
    
    if db.update_conversation(user_id, conversation):
        return {"message": "Message sent successfully"}
    raise HTTPException(status_code=500, detail="Failed to send message")

@api_router.delete("/users/{user_id}/conversations/{conversation_id}")
async def delete_conversation(user_id: str, conversation_id: str):
    """Delete conversation"""
    if not db.delete_conversation(user_id, conversation_id):
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"message": "Conversation deleted successfully"}

# === CAMPAIGN ROUTES ===

@api_router.get("/users/{user_id}/campaigns", response_model=List[Campaign])
async def get_campaigns(user_id: str):
    """Get all campaigns for user"""
    return db.get_user_campaigns(user_id)

@api_router.post("/users/{user_id}/campaigns", response_model=Campaign)
async def create_campaign(user_id: str, campaign_data: CampaignCreate):
    """Create new campaign"""
    campaign = Campaign(**campaign_data.model_dump())
    return db.add_campaign(user_id, campaign)

@api_router.put("/users/{user_id}/campaigns/{campaign_id}", response_model=Campaign)
async def update_campaign(user_id: str, campaign_id: str, campaign_data: CampaignCreate):
    """Update campaign"""
    campaigns = db.get_user_campaigns(user_id)
    campaign = None
    for camp in campaigns:
        if camp.id == campaign_id:
            campaign = camp
            break
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    campaign.name = campaign_data.name
    campaign.message = campaign_data.message
    campaign.instance_id = campaign_data.instance_id
    campaign.target_groups = campaign_data.target_groups
    campaign.scheduled_at = campaign_data.scheduled_at
    
    if db.update_campaign(user_id, campaign):
        return campaign
    raise HTTPException(status_code=500, detail="Failed to update campaign")

@api_router.delete("/users/{user_id}/campaigns/{campaign_id}")
async def delete_campaign(user_id: str, campaign_id: str):
    """Delete campaign"""
    if not db.delete_campaign(user_id, campaign_id):
        raise HTTPException(status_code=404, detail="Campaign not found")
    return {"message": "Campaign deleted successfully"}

# === DASHBOARD ROUTES ===

@api_router.get("/users/{user_id}/dashboard")
async def get_dashboard_data(user_id: str):
    """Get dashboard statistics for user"""
    user = db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    conversations = db.get_user_conversations(user_id)
    campaigns = db.get_user_campaigns(user_id)
    
    # Calculate metrics
    total_instances = len(user.instances)
    active_instances = len([i for i in user.instances if i.status == "active"])
    total_conversations = len(conversations)
    unread_messages = sum(conv.unread for conv in conversations)
    active_campaigns = len([c for c in campaigns if c.status == "active"])
    
    return {
        "user": user,
        "metrics": {
            "total_instances": total_instances,
            "active_instances": active_instances,
            "total_conversations": total_conversations,
            "unread_messages": unread_messages,
            "active_campaigns": active_campaigns,
            "messages_today": 0  # Placeholder
        }
    }

# Include API router
app.include_router(api_router)

# Serve static files (frontend)
static_dir = Path(__file__).parent.parent / "frontend" / "build"
if not static_dir.exists():
    static_dir = Path(__file__).parent.parent / "static"

if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# Serve index.html for frontend routes
@app.get("/")
async def serve_frontend():
    """Serve the frontend application"""
    index_file = static_dir / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    
    # Fallback HTML if no build exists
    return """
    <!DOCTYPE html>
    <html>
    <head><title>WhatsApp Bot - Setup</title></head>
    <body>
        <h1>WhatsApp Bot Management System</h1>
        <p>Frontend não encontrado. Execute o build do frontend ou coloque os arquivos estáticos na pasta /static</p>
        <p>API disponível em: <a href="/docs">/docs</a></p>
    </body>
    </html>
    """

# Catch-all route for frontend routing
@app.get("/{path:path}")
async def serve_frontend_routes(path: str):
    """Serve frontend for all other routes"""
    index_file = static_dir / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    return await serve_frontend()