import os
import pymongo
from dotenv import load_dotenv

load_dotenv()
url = os.getenv('MONGODB_URL')
client = pymongo.MongoClient(url)
db = client.get_database('gharkhata')
res = db.inflow_pools.update_many({'household_code': 'GHAR-MAIN'}, {'$set': {'household_code': 'GHAR-SINGHFAMILY'}})
print(f'Updated {res.modified_count} inflows to GHAR-SINGHFAMILY')
