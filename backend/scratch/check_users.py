import os
import pymongo
from dotenv import load_dotenv

load_dotenv()
url = os.getenv('MONGODB_URL')
client = pymongo.MongoClient(url, tlsInsecure=True)
db = client.get_database('gharkhata')
for u in db.users.find({}, {'_id': 0}):
    print(u)
