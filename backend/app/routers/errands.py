from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
import datetime
from app.database import errands_collection, users_collection, get_next_id

router = APIRouter(prefix="/api/errands", tags=["Errand Checklist"])

class ErrandCreateReq(BaseModel):
    name: str
    category: str = "Groceries"
    added_by_id: int
    household_code: Optional[str] = None

class ErrandUpdateReq(BaseModel):
    status: Optional[str] = None
    name: Optional[str] = None
    category: Optional[str] = None

def _hydrate_errand(item: dict) -> dict:
    if not item:
        return None
    item_copy = dict(item)
    item_copy.pop("_id", None)
    added_by_id = item_copy.get("added_by_id")
    if added_by_id:
        item_copy["added_by"] = users_collection.find_one({"id": added_by_id}, {"_id": 0})
    else:
        item_copy["added_by"] = None
    return item_copy

@router.get("")
def get_errands(category: Optional[str] = None, status: Optional[str] = None, household_code: Optional[str] = None):
    query = {}
    if category and category != "ALL":
        query["category"] = category
    if status and status != "ALL":
        query["status"] = status
    if household_code:
        query["household_code"] = household_code.strip().upper()
        
    errands = list(errands_collection.find(query).sort("created_at", -1))
    return [_hydrate_errand(e) for e in errands]

@router.post("")
def create_errand(errand_in: ErrandCreateReq):
    new_id = get_next_id("errand_items")
    added_by = users_collection.find_one({"id": errand_in.added_by_id})
    code = (errand_in.household_code or (added_by.get("household_code") if added_by else "GHAR-MAIN")).strip().upper()

    errand = {
        "id": new_id,
        "name": errand_in.name,
        "category": errand_in.category,
        "status": "PENDING",
        "added_by_id": errand_in.added_by_id,
        "household_code": code,
        "created_at": datetime.datetime.utcnow().isoformat()
    }
    errands_collection.insert_one(errand)
    res = errands_collection.find_one({"id": new_id})
    return _hydrate_errand(res)

@router.patch("/{errand_id}")
def update_errand(errand_id: int, errand_in: ErrandUpdateReq):
    existing = errands_collection.find_one({"id": errand_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Errand item not found")

    update_data = {k: v for k, v in errand_in.model_dump().items() if v is not None}
    if update_data:
        errands_collection.update_one({"id": errand_id}, {"$set": update_data})

    res = errands_collection.find_one({"id": errand_id})
    return _hydrate_errand(res)

@router.delete("/{errand_id}")
def delete_errand(errand_id: int):
    res = errands_collection.delete_one({"id": errand_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Errand item not found")
    return {"message": "Errand item deleted successfully"}
