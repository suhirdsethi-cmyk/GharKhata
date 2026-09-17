from typing import List, Dict, Optional
from app.database import users_collection, expenses_collection, settlements_collection

def calculate_net_dues(household_code: Optional[str] = None, db=None) -> List[Dict]:
    user_query = {}
    exp_query = {"funding_source": "PERSONAL"}
    st_query = {}

    if household_code:
        code = household_code.strip().upper()
        user_query["household_code"] = code
        exp_query["household_code"] = code
        st_query["household_code"] = code

    # 1. Fetch users for household
    users = list(users_collection.find(user_query, {"_id": 0}))
    user_map = {u["id"]: u["name"] for u in users}
    
    net_balances: Dict[int, float] = {u["id"]: 0.0 for u in users}

    # 2. Process PERSONAL expenses
    expenses = list(expenses_collection.find(exp_query, {"_id": 0}))
    for exp in expenses:
        payer_id = exp.get("payer_id")
        splits = exp.get("splits", [])
        for split in splits:
            user_id = split.get("user_id")
            share_amount = split.get("share_amount", 0.0)
            is_settled = split.get("is_settled", False)
            
            if not is_settled and user_id != payer_id:
                if user_id in net_balances:
                    net_balances[user_id] -= share_amount
                if payer_id in net_balances:
                    net_balances[payer_id] += share_amount

    # 3. Process cash settlements
    settlements = list(settlements_collection.find(st_query, {"_id": 0}))
    for st in settlements:
        payer_id = st.get("payer_id")
        receiver_id = st.get("receiver_id")
        amount = st.get("amount", 0.0)
        
        if payer_id in net_balances:
            net_balances[payer_id] += amount
        if receiver_id in net_balances:
            net_balances[receiver_id] -= amount

    # 4. Debt simplification (Greedy Min-Flow Algorithm)
    debtors = []   # (user_id, negative_balance)
    creditors = [] # (user_id, positive_balance)

    for uid, bal in net_balances.items():
        val = round(bal, 2)
        if val < -0.01:
            debtors.append({'id': uid, 'balance': val})
        elif val > 0.01:
            creditors.append({'id': uid, 'balance': val})

    debtors.sort(key=lambda x: x['balance']) # Most negative first
    creditors.sort(key=lambda x: x['balance'], reverse=True) # Most positive first

    result = []
    i = 0
    j = 0

    while i < len(debtors) and j < len(creditors):
        debtor = debtors[i]
        creditor = creditors[j]

        amount = min(-debtor['balance'], creditor['balance'])
        amount = round(amount, 2)

        if amount > 0:
            result.append({
                "from_user_id": debtor['id'],
                "from_user_name": user_map.get(debtor['id'], f"User #{debtor['id']}"),
                "to_user_id": creditor['id'],
                "to_user_name": user_map.get(creditor['id'], f"User #{creditor['id']}"),
                "amount": amount
            })

        debtor['balance'] += amount
        creditor['balance'] -= amount

        if abs(debtor['balance']) < 0.01:
            i += 1
        if abs(creditor['balance']) < 0.01:
            j += 1

    return result
