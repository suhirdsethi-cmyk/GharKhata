from fastapi import APIRouter, HTTPException, Query, UploadFile, File
from typing import List, Optional
from pydantic import BaseModel
import os
import uuid
import datetime
import re
from app.database import (
    expenses_collection, 
    users_collection, 
    inflows_collection, 
    market_collection, 
    get_next_id
)

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "static", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

class SplitCreateReq(BaseModel):
    user_id: int
    share_amount: float

class ExpenseCreateReq(BaseModel):
    title: str
    amount: float
    category: str
    payer_id: int
    funding_source: str = "PERSONAL"
    split_type: str = "EQUAL"
    date: str
    receipt_note: Optional[str] = None
    image_url: Optional[str] = None
    household_code: Optional[str] = None
    splits: Optional[List[SplitCreateReq]] = []

def _hydrate_expense(exp: dict) -> dict:
    if not exp:
        return None
    exp_copy = dict(exp)
    exp_copy.pop("_id", None)
    
    payer_id = exp_copy.get("payer_id")
    if payer_id:
        exp_copy["payer"] = users_collection.find_one({"id": payer_id}, {"_id": 0})
    else:
        exp_copy["payer"] = None
        
    splits = exp_copy.get("splits", [])
    hydrated_splits = []
    for s in splits:
        s_copy = dict(s)
        uid = s_copy.get("user_id")
        if uid:
            s_copy["user"] = users_collection.find_one({"id": uid}, {"_id": 0})
        hydrated_splits.append(s_copy)
    exp_copy["splits"] = hydrated_splits

    return exp_copy

@router.get("")
def get_expenses(
    month_year: Optional[str] = None,
    category: Optional[str] = None,
    funding_source: Optional[str] = None,
    search: Optional[str] = None,
    household_code: Optional[str] = None
):
    query = {}
    if month_year:
        query["date"] = {"$regex": f"^{month_year}"}
    if category and category != "ALL":
        query["category"] = category
    if funding_source and funding_source != "ALL":
        query["funding_source"] = funding_source
    if household_code:
        query["household_code"] = household_code.strip().upper()
    if search:
        regex_search = re.compile(search, re.IGNORECASE)
        query["$or"] = [
            {"title": regex_search},
            {"receipt_note": regex_search}
        ]

    expenses = list(expenses_collection.find(query).sort("date", -1))
    return [_hydrate_expense(e) for e in expenses]

@router.post("")
def create_expense(expense_in: ExpenseCreateReq):
    payer = users_collection.find_one({"id": expense_in.payer_id})
    if not payer:
        raise HTTPException(status_code=404, detail="Payer user not found")

    new_id = get_next_id("expenses")
    now_str = datetime.datetime.utcnow().isoformat()
    code = (expense_in.household_code or payer.get("household_code", "GHAR-MAIN")).strip().upper()

    splits_data = []
    if expense_in.funding_source == "PERSONAL":
        all_users = list(users_collection.find({"household_code": code}, {"_id": 0}))
        user_ids = [u["id"] for u in all_users]

        if expense_in.splits and len(expense_in.splits) > 0:
            for s in expense_in.splits:
                splits_data.append({
                    "id": get_next_id("expense_splits"),
                    "expense_id": new_id,
                    "user_id": s.user_id,
                    "share_amount": float(s.share_amount),
                    "is_settled": False
                })
        else:
            if expense_in.split_type == "EQUAL":
                per_person = round(expense_in.amount / len(user_ids), 2) if user_ids else 0.0
                for uid in user_ids:
                    splits_data.append({
                        "id": get_next_id("expense_splits"),
                        "expense_id": new_id,
                        "user_id": uid,
                        "share_amount": per_person,
                        "is_settled": False
                    })
            elif expense_in.split_type == "FULL_BEHALF":
                splits_data.append({
                    "id": get_next_id("expense_splits"),
                    "expense_id": new_id,
                    "user_id": expense_in.payer_id,
                    "share_amount": float(expense_in.amount),
                    "is_settled": False
                })

    expense = {
        "id": new_id,
        "title": expense_in.title,
        "amount": float(expense_in.amount),
        "category": expense_in.category,
        "payer_id": expense_in.payer_id,
        "funding_source": expense_in.funding_source,
        "split_type": expense_in.split_type,
        "date": expense_in.date,
        "receipt_note": expense_in.receipt_note,
        "image_url": expense_in.image_url,
        "household_code": code,
        "created_at": now_str,
        "splits": splits_data
    }

    expenses_collection.insert_one(expense)
    res = expenses_collection.find_one({"id": new_id})
    return _hydrate_expense(res)

@router.delete("/{expense_id}")
def delete_expense(expense_id: int):
    res = expenses_collection.delete_one({"id": expense_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"message": "Expense deleted successfully"}

@router.post("/upload-receipt")
async def upload_receipt(file: UploadFile = File(...)):
    filename = f"{uuid.uuid4().hex}_{file.filename}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    
    with open(filepath, "wb") as f:
        content = await file.read()
        f.write(content)
        
    return {"url": f"/static/uploads/{filename}"}
