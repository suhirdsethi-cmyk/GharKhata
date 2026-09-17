import os
import pymongo
from dotenv import load_dotenv

load_dotenv()
url = os.getenv('MONGODB_URL')
client = pymongo.MongoClient(url)
db = client.get_database('gharkhata')

for u in db.users.find():
    uid = u['id']
    fam_code = u.get('family_household_code') or u.get('household_code') or 'GHAR-SINGHFAMILY'
    pers_code = u.get('personal_household_code') or f'GHAR-PERS-{uid}'
    active_mode = u.get('active_mode') or 'FAMILY'
    
    db.users.update_one(
        {'_id': u['_id']},
        {
            '$set': {
                'family_household_code': fam_code,
                'personal_household_code': pers_code,
                'active_mode': active_mode
            }
        }
    )

print("Initialized user ledger modes in MongoDB Atlas successfully.")
