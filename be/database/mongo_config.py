
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os
from dotenv import load_dotenv

load_dotenv()
uri = os.getenv("MONGO_URI")

mongo_cluster = MongoClient(uri)

mongo = mongo_cluster["soundsleuth"]



