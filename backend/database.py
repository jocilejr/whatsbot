import json
import os
from typing import Dict, List, Optional
from datetime import datetime
from .models import User, WhatsAppInstance, Conversation, Campaign

class SimpleDatabase:
    def __init__(self, data_file: str = "whatsapp_bot_data.json"):
        self.data_file = data_file
        self.data = self._load_data()
    
    def _load_data(self) -> Dict:
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                pass
        return {
            "users": [],
            "conversations": {},  # {user_id: [conversations]}
            "campaigns": {}  # {user_id: [campaigns]}
        }
    
    def _save_data(self):
        with open(self.data_file, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, indent=2, ensure_ascii=False, default=str)
    
    # User operations
    def create_user(self, user: User) -> User:
        user_dict = user.model_dump()
        self.data["users"].append(user_dict)
        self.data["conversations"][user.id] = []
        self.data["campaigns"][user.id] = []
        self._save_data()
        return user
    
    def get_user_by_id(self, user_id: str) -> Optional[User]:
        for user_data in self.data["users"]:
            if user_data["id"] == user_id:
                return User(**user_data)
        return None
    
    def get_user_by_username(self, username: str) -> Optional[User]:
        for user_data in self.data["users"]:
            if user_data["username"] == username:
                return User(**user_data)
        return None
    
    def get_all_users(self) -> List[User]:
        return [User(**user_data) for user_data in self.data["users"]]
    
    def update_user(self, user: User) -> User:
        for i, user_data in enumerate(self.data["users"]):
            if user_data["id"] == user.id:
                self.data["users"][i] = user.model_dump()
                self._save_data()
                return user
        return user
    
    def delete_user(self, user_id: str) -> bool:
        for i, user_data in enumerate(self.data["users"]):
            if user_data["id"] == user_id:
                del self.data["users"][i]
                if user_id in self.data["conversations"]:
                    del self.data["conversations"][user_id]
                if user_id in self.data["campaigns"]:
                    del self.data["campaigns"][user_id]
                self._save_data()
                return True
        return False
    
    # Instance operations (part of user)
    def add_instance_to_user(self, user_id: str, instance: WhatsAppInstance) -> bool:
        user = self.get_user_by_id(user_id)
        if user:
            user.instances.append(instance)
            self.update_user(user)
            return True
        return False
    
    def update_instance(self, user_id: str, instance: WhatsAppInstance) -> bool:
        user = self.get_user_by_id(user_id)
        if user:
            for i, inst in enumerate(user.instances):
                if inst.id == instance.id:
                    user.instances[i] = instance
                    self.update_user(user)
                    return True
        return False
    
    def remove_instance(self, user_id: str, instance_id: str) -> bool:
        user = self.get_user_by_id(user_id)
        if user:
            user.instances = [inst for inst in user.instances if inst.id != instance_id]
            self.update_user(user)
            return True
        return False
    
    # Conversation operations
    def get_user_conversations(self, user_id: str) -> List[Conversation]:
        convs_data = self.data["conversations"].get(user_id, [])
        return [Conversation(**conv) for conv in convs_data]
    
    def add_conversation(self, user_id: str, conversation: Conversation) -> Conversation:
        if user_id not in self.data["conversations"]:
            self.data["conversations"][user_id] = []
        self.data["conversations"][user_id].append(conversation.model_dump())
        self._save_data()
        return conversation
    
    def update_conversation(self, user_id: str, conversation: Conversation) -> bool:
        if user_id in self.data["conversations"]:
            for i, conv in enumerate(self.data["conversations"][user_id]):
                if conv["id"] == conversation.id:
                    self.data["conversations"][user_id][i] = conversation.model_dump()
                    self._save_data()
                    return True
        return False
    
    def delete_conversation(self, user_id: str, conversation_id: str) -> bool:
        if user_id in self.data["conversations"]:
            self.data["conversations"][user_id] = [
                conv for conv in self.data["conversations"][user_id] 
                if conv["id"] != conversation_id
            ]
            self._save_data()
            return True
        return False
    
    # Campaign operations
    def get_user_campaigns(self, user_id: str) -> List[Campaign]:
        camps_data = self.data["campaigns"].get(user_id, [])
        return [Campaign(**camp) for camp in camps_data]
    
    def add_campaign(self, user_id: str, campaign: Campaign) -> Campaign:
        if user_id not in self.data["campaigns"]:
            self.data["campaigns"][user_id] = []
        self.data["campaigns"][user_id].append(campaign.model_dump())
        self._save_data()
        return campaign
    
    def update_campaign(self, user_id: str, campaign: Campaign) -> bool:
        if user_id in self.data["campaigns"]:
            for i, camp in enumerate(self.data["campaigns"][user_id]):
                if camp["id"] == campaign.id:
                    self.data["campaigns"][user_id][i] = campaign.model_dump()
                    self._save_data()
                    return True
        return False
    
    def delete_campaign(self, user_id: str, campaign_id: str) -> bool:
        if user_id in self.data["campaigns"]:
            self.data["campaigns"][user_id] = [
                camp for camp in self.data["campaigns"][user_id] 
                if camp["id"] != campaign_id
            ]
            self._save_data()
            return True
        return False

# Global database instance
db = SimpleDatabase()