from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel
import datetime
from app.database import (
    users_collection, 
    market_collection, 
    expenses_collection, 
    inflows_collection, 
    errands_collection, 
    settlements_collection,
    get_next_id
)

router = APIRouter(prefix="/api/users", tags=["Users"])

class UserCreateReq(BaseModel):
    name: str
    role: Optional[str] = "Member"
    avatar_color: Optional[str] = "#3B82F6"
    household_code: Optional[str] = None

@router.get("")
def get_users(household_code: Optional[str] = None):
    query = {}
    if household_code:
        query["household_code"] = household_code.strip().upper()
    users = list(users_collection.find(query, {"_id": 0}))
    return users

@router.post("")
def create_user(user_in: UserCreateReq):
    new_id = get_next_id("users")
    now_str = datetime.datetime.utcnow().isoformat()
    code = user_in.household_code or "GHAR-MAIN"
    
    user = {
        "id": new_id,
        "name": user_in.name,
        "role": user_in.role or "Member",
        "avatar_color": user_in.avatar_color or "#3B82F6",
        "household_code": code,
        "created_at": now_str
    }
    users_collection.insert_one(user)
    
    # Initialize market status for user
    market_collection.insert_one({
        "id": get_next_id("market_status"),
        "user_id": new_id,
        "household_code": code,
        "is_active": False,
        "updated_at": now_str
    })

    user_res = users_collection.find_one({"id": new_id}, {"_id": 0})
    return user_res

@router.post("/reset-data")
def reset_sample_data(household_code: Optional[str] = None):
    query = {}
    if household_code:
        query = {"household_code": household_code}
        
    expenses_collection.delete_many(query)
    inflows_collection.delete_many(query)
    errands_collection.delete_many(query)
    settlements_collection.delete_many(query)
    market_collection.update_many(query, {"$set": {"is_active": False}})
    return {"message": "All sample data has been reset successfully in MongoDB Atlas!"}
