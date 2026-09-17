from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel
import datetime
from app.database import inflows_collection, get_next_id

router = APIRouter(prefix="/api/inflows", tags=["Inflow Pool"])

class InflowCreateReq(BaseModel):
    title: str
    amount: float
    month_year: str
    household_code: Optional[str] = None

class InflowUpdateReq(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    month_year: Optional[str] = None

@router.get("")
def get_inflows(month_year: Optional[str] = None, household_code: Optional[str] = None):
    query = {}
    if month_year:
        query["month_year"] = month_year
    if household_code:
        query["household_code"] = household_code.strip().upper()

    inflows = list(inflows_collection.find(query, {"_id": 0}).sort("created_at", -1))
    return inflows

@router.post("")
def create_inflow(inflow_in: InflowCreateReq):
    new_id = get_next_id("inflow_pools")
    inflow = {
        "id": new_id,
        "title": inflow_in.title,
        "amount": float(inflow_in.amount),
        "month_year": inflow_in.month_year,
        "household_code": (inflow_in.household_code or "GHAR-MAIN").strip().upper(),
        "created_at": datetime.datetime.utcnow().isoformat()
    }
    inflows_collection.insert_one(inflow)
    return inflows_collection.find_one({"id": new_id}, {"_id": 0})

@router.put("/{inflow_id}")
def update_inflow(inflow_id: int, inflow_in: InflowUpdateReq):
    existing = inflows_collection.find_one({"id": inflow_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Inflow record not found")
    
    update_data = {k: v for k, v in inflow_in.model_dump().items() if v is not None}
    if update_data:
        inflows_collection.update_one({"id": inflow_id}, {"$set": update_data})
    
    return inflows_collection.find_one({"id": inflow_id}, {"_id": 0})

@router.delete("/{inflow_id}")
def delete_inflow(inflow_id: int):
    res = inflows_collection.delete_one({"id": inflow_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Inflow record not found")
    return {"message": "Inflow record deleted successfully"}
