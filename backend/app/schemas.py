from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    role: str = "Member"
    avatar_color: str = "#3B82F6"

class UserCreate(UserBase):
    pass

class UserOut(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class InflowPoolBase(BaseModel):
    title: str
    amount: float
    month_year: str # YYYY-MM

class InflowPoolCreate(InflowPoolBase):
    pass

class InflowPoolUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    month_year: Optional[str] = None

class InflowPoolOut(InflowPoolBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ExpenseSplitBase(BaseModel):
    user_id: int
    share_amount: float

class ExpenseSplitCreate(ExpenseSplitBase):
    pass

class ExpenseSplitOut(ExpenseSplitBase):
    id: int
    expense_id: int
    is_settled: bool
    user: Optional[UserOut] = None

    class Config:
        from_attributes = True

class ExpenseCreate(BaseModel):
    title: str
    amount: float
    category: str
    payer_id: int
    funding_source: str = "PERSONAL" # RENTAL_POOL or PERSONAL
    split_type: str = "EQUAL" # EQUAL, CUSTOM, FULL_BEHALF
    date: str # YYYY-MM-DD
    receipt_note: Optional[str] = None
    image_url: Optional[str] = None
    splits: Optional[List[ExpenseSplitCreate]] = []

class ExpenseOut(BaseModel):
    id: int
    title: str
    amount: float
    category: str
    payer_id: int
    funding_source: str
    split_type: str
    date: str
    receipt_note: Optional[str] = None
    image_url: Optional[str] = None
    created_at: datetime
    payer: Optional[UserOut] = None
    splits: List[ExpenseSplitOut] = []

    class Config:
        from_attributes = True

class ErrandItemBase(BaseModel):
    name: str
    category: str = "Groceries"

class ErrandItemCreate(ErrandItemBase):
    added_by_id: int

class ErrandItemUpdate(BaseModel):
    status: Optional[str] = None
    name: Optional[str] = None
    category: Optional[str] = None

class ErrandItemOut(ErrandItemBase):
    id: int
    status: str
    added_by_id: int
    created_at: datetime
    added_by: Optional[UserOut] = None

    class Config:
        from_attributes = True

class MarketStatusUpdate(BaseModel):
    is_active: bool

class MarketStatusOut(BaseModel):
    id: int
    user_id: int
    is_active: bool
    updated_at: datetime
    user: Optional[UserOut] = None

    class Config:
        from_attributes = True

class SettlementCreate(BaseModel):
    payer_id: int
    receiver_id: int
    amount: float
    notes: Optional[str] = None

class SettlementOut(BaseModel):
    id: int
    payer_id: int
    receiver_id: int
    amount: float
    notes: Optional[str] = None
    created_at: datetime
    payer: Optional[UserOut] = None
    receiver: Optional[UserOut] = None

    class Config:
        from_attributes = True

class NetBalanceItem(BaseModel):
    from_user_id: int
    from_user_name: str
    to_user_id: int
    to_user_name: str
    amount: float

class DashboardStats(BaseModel):
    total_monthly_inflow: float
    spent_from_pool: float
    remaining_rental_balance: float
    total_personal_expenses: float
    net_dues_list: List[NetBalanceItem]
    active_market_beacons: List[MarketStatusOut]
