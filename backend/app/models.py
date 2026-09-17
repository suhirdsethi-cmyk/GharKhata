import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class UserRole(str, enum.Enum):
    ADMIN = "Admin"
    MEMBER = "Member"

class FundingSource(str, enum.Enum):
    RENTAL_POOL = "RENTAL_POOL"
    PERSONAL = "PERSONAL"

class SplitType(str, enum.Enum):
    EQUAL = "EQUAL"
    CUSTOM = "CUSTOM"
    FULL_BEHALF = "FULL_BEHALF"

class ErrandStatus(str, enum.Enum):
    PENDING = "PENDING"
    IN_CART = "IN_CART"
    BOUGHT = "BOUGHT"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    role = Column(String, default="Member")
    avatar_color = Column(String, default="#3B82F6") # HEX code for UI avatar
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    expenses_paid = relationship("Expense", back_populates="payer")
    errands_added = relationship("ErrandItem", back_populates="added_by")
    market_status = relationship("MarketStatus", back_populates="user", uselist=False)

class InflowPool(Base):
    __tablename__ = "inflow_pools"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    month_year = Column(String, nullable=False, index=True) # Format: YYYY-MM
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String, nullable=False) # Groceries, Utilities, Maintenance, Miscellaneous
    payer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    funding_source = Column(String, nullable=False, default="PERSONAL") # RENTAL_POOL, PERSONAL
    split_type = Column(String, default="EQUAL") # EQUAL, CUSTOM, FULL_BEHALF
    date = Column(String, nullable=False) # Format YYYY-MM-DD
    receipt_note = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    payer = relationship("User", back_populates="expenses_paid")
    splits = relationship("ExpenseSplit", back_populates="expense", cascade="all, delete-orphan")

class ExpenseSplit(Base):
    __tablename__ = "expense_splits"

    id = Column(Integer, primary_key=True, index=True)
    expense_id = Column(Integer, ForeignKey("expenses.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    share_amount = Column(Float, nullable=False)
    is_settled = Column(Boolean, default=False)

    expense = relationship("Expense", back_populates="splits")
    user = relationship("User")

class ErrandItem(Base):
    __tablename__ = "errand_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False) # Vegetables & Fruit, Dairy & Bread, Spices & Staples, Chemist/Pharmacy, Hardware/Repairs, Misc
    status = Column(String, default="PENDING") # PENDING, IN_CART, BOUGHT
    added_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    added_by = relationship("User", back_populates="errands_added")

class MarketStatus(Base):
    __tablename__ = "market_status"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    is_active = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="market_status")

class Settlement(Base):
    __tablename__ = "settlements"

    id = Column(Integer, primary_key=True, index=True)
    payer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    payer = relationship("User", foreign_keys=[payer_id])
    receiver = relationship("User", foreign_keys=[receiver_id])
