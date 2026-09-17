from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
import datetime
import re
from app.database import (
    settlements_collection, 
    users_collection, 
    inflows_collection, 
    expenses_collection, 
    market_collection, 
    get_next_id
)
from app.debt_simplifier import calculate_net_dues

router = APIRouter(prefix="/api", tags=["Settlements & Stats"])

class SettlementCreateReq(BaseModel):
    payer_id: int
    receiver_id: int
    amount: float
    notes: Optional[str] = None
    household_code: Optional[str] = None

def _hydrate_settlement(st: dict) -> dict:
    if not st:
        return None
    st_copy = dict(st)
    st_copy.pop("_id", None)
    
    pid = st_copy.get("payer_id")
    rid = st_copy.get("receiver_id")
    
    st_copy["payer"] = users_collection.find_one({"id": pid}, {"_id": 0}) if pid else None
    st_copy["receiver"] = users_collection.find_one({"id": rid}, {"_id": 0}) if rid else None
    return st_copy

@router.get("/dues/net")
def get_net_dues(household_code: Optional[str] = None):
    return calculate_net_dues(household_code=household_code)

@router.post("/settlements")
def record_settlement(st_in: SettlementCreateReq):
    if st_in.payer_id == st_in.receiver_id:
        raise HTTPException(status_code=400, detail="Payer and Receiver cannot be the same user")

    payer = users_collection.find_one({"id": st_in.payer_id})
    code = (st_in.household_code or (payer.get("household_code") if payer else "GHAR-MAIN")).strip().upper()

    new_id = get_next_id("settlements")
    settlement = {
        "id": new_id,
        "payer_id": st_in.payer_id,
        "receiver_id": st_in.receiver_id,
        "amount": float(st_in.amount),
        "notes": st_in.notes,
        "household_code": code,
        "created_at": datetime.datetime.utcnow().isoformat()
    }
    settlements_collection.insert_one(settlement)
    res = settlements_collection.find_one({"id": new_id})
    return _hydrate_settlement(res)

@router.get("/settlements")
def get_settlements(household_code: Optional[str] = None):
    query = {}
    if household_code:
        query["household_code"] = household_code.strip().upper()
    settlements = list(settlements_collection.find(query).sort("created_at", -1))
    return [_hydrate_settlement(s) for s in settlements]

@router.get("/stats")
def get_dashboard_stats(month_year: Optional[str] = "2026-09", household_code: Optional[str] = None):
    inflow_query = {"month_year": month_year}
    pool_exp_query = {"funding_source": "RENTAL_POOL", "date": {"$regex": f"^{month_year}"}}
    pers_exp_query = {"funding_source": "PERSONAL", "date": {"$regex": f"^{month_year}"}}
    market_query = {"is_active": True}

    if household_code:
        code = household_code.strip().upper()
        inflow_query["household_code"] = code
        pool_exp_query["household_code"] = code
        pers_exp_query["household_code"] = code
        market_query["household_code"] = code

    # Total monthly inflow for specified month
    inflows = list(inflows_collection.find(inflow_query, {"_id": 0}))
    total_inflow = sum(i.get("amount", 0.0) for i in inflows)

    # Expenses funded from rental pool for specified month
    pool_expenses = list(expenses_collection.find(pool_exp_query, {"_id": 0}))
    spent_from_pool = sum(e.get("amount", 0.0) for e in pool_expenses)

    remaining_pool = total_inflow - spent_from_pool

    # Total personal expenses logged for month
    personal_expenses = list(expenses_collection.find(pers_exp_query, {"_id": 0}))
    total_personal = sum(e.get("amount", 0.0) for e in personal_expenses)

    # Net dues list
    net_dues = calculate_net_dues(household_code=household_code)

    # Active market beacons
    active_beacons_raw = list(market_collection.find(market_query))
    active_beacons = []
    for ms in active_beacons_raw:
        ms_copy = dict(ms)
        ms_copy.pop("_id", None)
        uid = ms_copy.get("user_id")
        ms_copy["user"] = users_collection.find_one({"id": uid}, {"_id": 0}) if uid else None
        active_beacons.append(ms_copy)

    # Category breakdown for all expenses in month
    all_exp_query = {"date": {"$regex": f"^{month_year}"}}
    if household_code:
        all_exp_query["household_code"] = household_code.strip().upper()
    all_expenses = list(expenses_collection.find(all_exp_query, {"_id": 0}))
    category_breakdown = {}
    for e in all_expenses:
        cat = e.get("category", "Miscellaneous")
        category_breakdown[cat] = round(category_breakdown.get(cat, 0.0) + float(e.get("amount", 0.0)), 2)

    return {
        "total_monthly_inflow": round(total_inflow, 2),
        "spent_from_pool": round(spent_from_pool, 2),
        "remaining_rental_balance": round(remaining_pool, 2),
        "total_personal_expenses": round(total_personal, 2),
        "net_dues_list": net_dues,
        "active_market_beacons": active_beacons,
        "category_breakdown": category_breakdown
    }
