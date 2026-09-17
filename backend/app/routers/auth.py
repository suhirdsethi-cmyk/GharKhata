from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
import random
import string
import datetime
from google.oauth2 import id_token
from google.auth.transport import requests
from app.database import (
    users_collection, 
    market_collection, 
    expenses_collection, 
    inflows_collection, 
    errands_collection, 
    settlements_collection,
    get_next_id
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "319153506465-flf52uulo7e01k5c3s63vgqpe6jqt0r0.apps.googleusercontent.com")

class GoogleAuthRequest(BaseModel):
    credential: str
    household_code: Optional[str] = None # Optional code to join an existing family household right away

class JoinHouseholdRequest(BaseModel):
    user_id: int
    household_code: str

class CreateHouseholdRequest(BaseModel):
    user_id: int
    custom_code: Optional[str] = None

class SwitchModeRequest(BaseModel):
    user_id: int
    mode: str

def generate_household_code() -> str:
    """Generate a clean 6-character family household code (e.g. GHAR-9481)."""
    digits = ''.join(random.choices(string.digits, k=4))
    return f"GHAR-{digits}"

@router.post("/google")
def google_auth(auth_in: GoogleAuthRequest):
    try:
        # Verify Google ID Token
        id_info = id_token.verify_oauth2_token(
            auth_in.credential, 
            requests.Request(), 
            GOOGLE_CLIENT_ID
        )

        google_id = id_info.get("sub")
        email = id_info.get("email")
        name = id_info.get("name")
        picture = id_info.get("picture")

        if not email:
            raise HTTPException(status_code=400, detail="Invalid Google token profile")

        # Find user in MongoDB
        user = users_collection.find_one({"email": email})
        
        if not user:
            # Determine Household Code
            target_code = auth_in.household_code.strip().upper() if auth_in.household_code else None
            
            if not target_code:
                target_code = "GHAR-SINGHFAMILY"

            new_id = get_next_id("users")
            user = {
                "id": new_id,
                "google_id": google_id,
                "email": email,
                "name": name,
                "role": "Admin",
                "avatar_color": "#3B82F6",
                "picture": picture,
                "household_code": target_code,
                "family_household_code": target_code,
                "personal_household_code": f"GHAR-PERS-{new_id}",
                "active_mode": "FAMILY",
                "created_at": datetime.datetime.utcnow().isoformat()
            }
            users_collection.insert_one(user)
            
            # Initialize MarketStatus for user
            market_collection.insert_one({
                "id": get_next_id("market_status"),
                "user_id": new_id,
                "household_code": target_code,
                "is_active": False,
                "updated_at": datetime.datetime.utcnow().isoformat()
            })
        else:
            # Update profile info
            update_fields = {"name": name, "picture": picture, "google_id": google_id}
            
            # If user provided a specific household code to join
            if auth_in.household_code:
                update_fields["household_code"] = auth_in.household_code.strip().upper()

            users_collection.update_one({"email": email}, {"$set": update_fields})
            user = users_collection.find_one({"email": email})

        user.pop("_id", None)
        return {"status": "success", "user": user}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Google authentication failed: {str(e)}")

@router.post("/switch-mode")
def switch_mode(req: SwitchModeRequest):
    user = users_collection.find_one({"id": req.user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    uid = user["id"]
    mode = req.mode.upper()
    if mode not in ["PERSONAL", "FAMILY"]:
        raise HTTPException(status_code=400, detail="Invalid mode. Must be PERSONAL or FAMILY")

    family_code = user.get("family_household_code")
    if not family_code:
        curr = user.get("household_code", "")
        if curr and not curr.startswith("GHAR-PERS"):
            family_code = curr
        else:
            family_code = "GHAR-SINGHFAMILY"

    personal_code = user.get("personal_household_code") or f"GHAR-PERS-{uid}"

    active_code = personal_code if mode == "PERSONAL" else family_code

    users_collection.update_one(
        {"id": req.user_id},
        {
            "$set": {
                "household_code": active_code,
                "family_household_code": family_code,
                "personal_household_code": personal_code,
                "active_mode": mode
            }
        }
    )

    market_collection.update_one(
        {"user_id": req.user_id},
        {"$set": {"household_code": active_code}}
    )

    updated_user = users_collection.find_one({"id": req.user_id}, {"_id": 0})
    return {"message": f"Switched to {mode} mode", "user": updated_user}

@router.post("/create-household")
def create_household(req: CreateHouseholdRequest):
    user = users_collection.find_one({"id": req.user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if req.custom_code and req.custom_code.strip():
        code = req.custom_code.strip().upper()
        if not code.startswith("GHAR-"):
            code = f"GHAR-{code}"
    else:
        code = generate_household_code()

    users_collection.update_one(
        {"id": req.user_id},
        {"$set": {"household_code": code, "family_household_code": code, "active_mode": "FAMILY"}}
    )
    
    market_collection.update_one(
        {"user_id": req.user_id},
        {"$set": {"household_code": code}}
    )

    updated_user = users_collection.find_one({"id": req.user_id}, {"_id": 0})
    return {"message": f"Successfully created Household Code {code}", "user": updated_user, "household_code": code}

@router.post("/join-household")
def join_household(req: JoinHouseholdRequest):
    code = req.household_code.strip().upper()
    if not code:
        raise HTTPException(status_code=400, detail="Household code is required")
    
    if not code.startswith("GHAR-"):
        code = f"GHAR-{code}"

    # Update user's household code
    users_collection.update_one(
        {"id": req.user_id},
        {"$set": {"household_code": code, "family_household_code": code, "active_mode": "FAMILY"}}
    )
    
    market_collection.update_one(
        {"user_id": req.user_id},
        {"$set": {"household_code": code}}
    )

    updated_user = users_collection.find_one({"id": req.user_id}, {"_id": 0})
    return {"message": f"Successfully joined Household {code}", "user": updated_user}

@router.get("/me/{user_id}")
def get_current_user_profile(user_id: int):
    user = users_collection.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
