import os
import json
import datetime
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass
from pymongo import MongoClient
from pymongo.collection import ReturnDocument

load_dotenv()

MONGODB_URL = os.getenv(
    "MONGODB_URL",
    "mongodb+srv://suhird665_db_user:neLUkw4dBAeHbeQP@cluster0.wyb8ene.mongodb.net/gharkhata?retryWrites=true&w=majority"
)

LOCAL_DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "local_db.json")

def _init_db():
    try:
        client = MongoClient(MONGODB_URL, serverSelectionTimeoutMS=2000, tlsAllowInvalidCertificates=True)
        client.admin.command('ping')
        db = client.get_database("gharkhata")
        print("MongoDB Atlas connected successfully!")
        return db, False
    except Exception as e:
        print(f"MongoDB Atlas SSL/Connection status: {e}. Operating in ultra-fast local persistent mode.")
        import mongomock
        mock_client = mongomock.MongoClient()
        db = mock_client.get_database("gharkhata")
        
        if os.path.exists(LOCAL_DB_PATH):
            try:
                with open(LOCAL_DB_PATH, "r") as f:
                    data = json.load(f)
                for col_name, docs in data.items():
                    if docs:
                        db[col_name].insert_many(docs)
            except Exception as le:
                print(f"Error loading local_db.json: {le}")
        return db, True

raw_db, is_local_mode = _init_db()
mongo_db = raw_db

def _save_local_db():
    if not is_local_mode:
        return
    try:
        data = {}
        cols = ["users", "inflow_pools", "expenses", "errand_items", "market_status", "settlements", "counters"]
        for c in cols:
            docs = list(raw_db[c].find())
            clean_docs = []
            for d in docs:
                dc = dict(d)
                dc.pop("_id", None)
                clean_docs.append(dc)
            data[c] = clean_docs
        with open(LOCAL_DB_PATH, "w") as f:
            json.dump(data, f, indent=2)
    except Exception as err:
        print(f"Error saving to local_db.json: {err}")

class CollectionWrapper:
    def __init__(self, collection):
        self._col = collection

    def insert_one(self, doc):
        res = self._col.insert_one(doc)
        _save_local_db()
        return res

    def insert_many(self, docs):
        res = self._col.insert_many(docs)
        _save_local_db()
        return res

    def update_one(self, filter, update, **kwargs):
        res = self._col.update_one(filter, update, **kwargs)
        _save_local_db()
        return res

    def update_many(self, filter, update, **kwargs):
        res = self._col.update_many(filter, update, **kwargs)
        _save_local_db()
        return res

    def delete_one(self, filter):
        res = self._col.delete_one(filter)
        _save_local_db()
        return res

    def delete_many(self, filter):
        res = self._col.delete_many(filter)
        _save_local_db()
        return res

    def find_one_and_update(self, filter, update, **kwargs):
        res = self._col.find_one_and_update(filter, update, **kwargs)
        _save_local_db()
        return res

    def find_one(self, *args, **kwargs):
        return self._col.find_one(*args, **kwargs)

    def find(self, *args, **kwargs):
        return self._col.find(*args, **kwargs)

    def count_documents(self, *args, **kwargs):
        return self._col.count_documents(*args, **kwargs)

users_collection = CollectionWrapper(raw_db["users"])
inflows_collection = CollectionWrapper(raw_db["inflow_pools"])
expenses_collection = CollectionWrapper(raw_db["expenses"])
errands_collection = CollectionWrapper(raw_db["errand_items"])
market_collection = CollectionWrapper(raw_db["market_status"])
settlements_collection = CollectionWrapper(raw_db["settlements"])
counters_collection = CollectionWrapper(raw_db["counters"])

def get_next_id(sequence_name: str) -> int:
    col_map = {
        "users": "users",
        "inflow_pools": "inflow_pools",
        "expenses": "expenses",
        "expense_splits": "expenses",
        "errand_items": "errand_items",
        "market_status": "market_status",
        "settlements": "settlements"
    }
    if is_local_mode:
        target = col_map.get(sequence_name, sequence_name)
        try:
            docs = list(raw_db[target].find())
            existing_ids = [d.get("id", 0) for d in docs if isinstance(d.get("id"), int)]
            if existing_ids:
                return max(existing_ids) + 1
        except Exception:
            pass
        return 1

    result = counters_collection.find_one_and_update(
        {"_id": sequence_name},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER
    )
    if isinstance(result, dict):
        return result.get("seq", 1)
    return getattr(result, "seq", 1)

def get_db():
    yield None
