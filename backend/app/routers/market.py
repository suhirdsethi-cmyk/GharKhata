from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
import datetime
from app.database import market_collection, users_collection, get_next_id

router = APIRouter(prefix="/api/market-status", tags=["Market Beacon"])

class MarketStatusUpdateReq(BaseModel):
    is_active: bool

def _hydrate_market_status(ms: dict) -> dict:
    if not ms:
        return None
    ms_copy = dict(ms)
    ms_copy.pop("_id", None)
    uid = ms_copy.get("user_id")
    if uid:
        ms_copy["user"] = users_collection.find_one({"id": uid}, {"_id": 0})
    else:
        ms_copy["user"] = None
    return ms_copy

@router.get("")
def get_market_status():
    statuses = list(market_collection.find({}))
    return [_hydrate_market_status(s) for s in statuses]

@router.get("/active")
def get_active_beacons():
    statuses = list(market_collection.find({"is_active": True}))
    return [_hydrate_market_status(s) for s in statuses]

@router.post("/toggle/{user_id}")
def toggle_market_status(user_id: int, status_in: Optional[MarketStatusUpdateReq] = None):
    ms = market_collection.find_one({"user_id": user_id})
    now_str = datetime.datetime.utcnow().isoformat()

    if not ms:
        user = users_collection.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        init_active = status_in.is_active if status_in is not None else True
        new_id = get_next_id("market_status")
        ms_doc = {
            "id": new_id,
            "user_id": user_id,
            "is_active": init_active,
            "updated_at": now_str
        }
        market_collection.insert_one(ms_doc)
    else:
        new_active = status_in.is_active if status_in is not None else not ms.get("is_active", False)
        market_collection.update_one(
            {"user_id": user_id},
            {"$set": {"is_active": new_active, "updated_at": now_str}}
        )

    updated_ms = market_collection.find_one({"user_id": user_id})
    return _hydrate_market_status(updated_ms)
