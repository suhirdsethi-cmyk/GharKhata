from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, Base
from app.models import User, InflowPool, Expense, ExpenseSplit, ErrandItem, MarketStatus, Settlement, FundingSource, SplitType, ErrandStatus
import datetime

def clear_database():
    """Deletes all sample data from database to start fresh."""
    db = SessionLocal()
    try:
        db.query(ExpenseSplit).delete()
        db.query(Expense).delete()
        db.query(InflowPool).delete()
        db.query(ErrandItem).delete()
        db.query(Settlement).delete()
        db.query(MarketStatus).delete()
        # Reset market status for all users to False
        db.commit()
        print("Database cleared of all sample/example entries.")
    except Exception as e:
        db.rollback()
        print(f"Error clearing database: {e}")
    finally:
        db.close()

def seed_database(clean: bool = False):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if clean:
        clear_database()
        return

    try:
        # Check if users already exist
        if db.query(User).count() > 0:
            print("Database already seeded.")
            return

        print("Seeding database with sample household data...")

        # 1. Users
        users = [
            User(name="Suhird Singh", role="Admin", avatar_color="#3B82F6"),
            User(name="Aman Sharma", role="Member", avatar_color="#10B981"),
            User(name="Priya Verma", role="Member", avatar_color="#EC4899"),
            User(name="Sunita Devi", role="Member", avatar_color="#F59E0B"),
        ]
        db.add_all(users)
        db.commit()

        u_suhird = db.query(User).filter(User.name == "Suhird Singh").first()
        u_aman = db.query(User).filter(User.name == "Aman Sharma").first()
        u_priya = db.query(User).filter(User.name == "Priya Verma").first()
        u_sunita = db.query(User).filter(User.name == "Sunita Devi").first()

        current_month = "2026-09"

        # 2. Inflow Pools (Rental Income)
        inflows = [
            InflowPool(title="Ground Floor Rent - Flat 101", amount=35000.0, month_year=current_month),
            InflowPool(title="First Floor Rent - Flat 201", amount=25000.0, month_year=current_month),
        ]
        db.add_all(inflows)
        db.commit()

        # 3. Expenses
        exp1 = Expense(
            title="Monthly Milk Token (Mother Dairy)",
            amount=4200.0,
            category="Groceries",
            payer_id=u_suhird.id,
            funding_source=FundingSource.RENTAL_POOL.value,
            split_type=SplitType.EQUAL.value,
            date="2026-09-02",
            receipt_note="Auto-paid from central rental cash reserve"
        )
        
        exp2 = Expense(
            title="BSES Electricity Bill (Whole House)",
            amount=7850.0,
            category="Utilities",
            payer_id=u_suhird.id,
            funding_source=FundingSource.RENTAL_POOL.value,
            split_type=SplitType.EQUAL.value,
            date="2026-09-05",
            receipt_note="Paid online via net banking"
        )

        exp3 = Expense(
            title="Plumbing & Main Pipeline Repair",
            amount=1400.0,
            category="Maintenance",
            payer_id=u_suhird.id,
            funding_source=FundingSource.RENTAL_POOL.value,
            split_type=SplitType.EQUAL.value,
            date="2026-09-10",
            receipt_note="Replaced damaged valve in overhead tank"
        )

        # Personal out-of-pocket expense 1: Veggies bought by Suhird split equally among Suhird, Aman, Priya
        exp4 = Expense(
            title="Weekly Fresh Veggies & Fruits (Local Mandi)",
            amount=1800.0,
            category="Groceries",
            payer_id=u_suhird.id,
            funding_source=FundingSource.PERSONAL.value,
            split_type=SplitType.EQUAL.value,
            date="2026-09-12",
            receipt_note="Paid cash out-of-pocket by Suhird"
        )
        db.add_all([exp1, exp2, exp3, exp4])
        db.commit()

        # Splits for exp4 (1800 / 3 = 600 per person)
        db.add_all([
            ExpenseSplit(expense_id=exp4.id, user_id=u_suhird.id, share_amount=600.0, is_settled=False),
            ExpenseSplit(expense_id=exp4.id, user_id=u_aman.id, share_amount=600.0, is_settled=False),
            ExpenseSplit(expense_id=exp4.id, user_id=u_priya.id, share_amount=600.0, is_settled=False),
        ])

        # Personal expense 2: Dinner by Aman split among 4 users (2400 / 4 = 600 each)
        exp5 = Expense(
            title="Family Dinner Outing (Haldiram's)",
            amount=2400.0,
            category="Miscellaneous",
            payer_id=u_aman.id,
            funding_source=FundingSource.PERSONAL.value,
            split_type=SplitType.EQUAL.value,
            date="2026-09-14",
            receipt_note="Aman paid bill"
        )
        db.add(exp5)
        db.commit()

        db.add_all([
            ExpenseSplit(expense_id=exp5.id, user_id=u_suhird.id, share_amount=600.0, is_settled=False),
            ExpenseSplit(expense_id=exp5.id, user_id=u_aman.id, share_amount=600.0, is_settled=False),
            ExpenseSplit(expense_id=exp5.id, user_id=u_priya.id, share_amount=600.0, is_settled=False),
            ExpenseSplit(expense_id=exp5.id, user_id=u_sunita.id, share_amount=600.0, is_settled=False),
        ])

        # Personal expense 3: Priya bought medicine for Sunita (100% on behalf)
        exp6 = Expense(
            title="Prescription Medicines (Apollo Chemist)",
            amount=650.0,
            category="Chemist/Pharmacy",
            payer_id=u_priya.id,
            funding_source=FundingSource.PERSONAL.value,
            split_type=SplitType.FULL_BEHALF.value,
            date="2026-09-15",
            receipt_note="Bought for Sunita Ji"
        )
        db.add(exp6)
        db.commit()

        db.add(ExpenseSplit(expense_id=exp6.id, user_id=u_sunita.id, share_amount=650.0, is_settled=False))
        db.commit()

        # 4. Errand Checklist Items
        errands = [
            ErrandItem(name="Fresh Tomatoes & Spinach (2 kg)", category="Vegetables & Fruit", status=ErrandStatus.PENDING.value, added_by_id=u_suhird.id),
            ErrandItem(name="Full Cream Milk (2 Packets)", category="Dairy & Bread", status=ErrandStatus.IN_CART.value, added_by_id=u_priya.id),
            ErrandItem(name="Garam Masala & Turmeric Powder", category="Spices & Staples", status=ErrandStatus.PENDING.value, added_by_id=u_sunita.id),
            ErrandItem(name="Floor Disinfectant Cleaner", category="Chemist/Pharmacy", status=ErrandStatus.BOUGHT.value, added_by_id=u_aman.id),
            ErrandItem(name="LED Bulb 12W (2 pcs)", category="Hardware/Repairs", status=ErrandStatus.PENDING.value, added_by_id=u_aman.id),
        ]
        db.add_all(errands)
        db.commit()

        # 5. Market Beacon Status
        market_statuses = [
            MarketStatus(user_id=u_suhird.id, is_active=False),
            MarketStatus(user_id=u_aman.id, is_active=True), # Aman currently out shopping!
            MarketStatus(user_id=u_priya.id, is_active=False),
            MarketStatus(user_id=u_sunita.id, is_active=False),
        ]
        db.add_all(market_statuses)
        db.commit()

        # 6. Sample Settlement
        settlement = Settlement(
            payer_id=u_priya.id,
            receiver_id=u_suhird.id,
            amount=400.0,
            notes="Cash partial settlement for groceries"
        )
        db.add(settlement)
        db.commit()

        print("Seeding completed successfully!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
