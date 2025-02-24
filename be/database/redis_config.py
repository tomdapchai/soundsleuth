import redis
from dotenv import load_dotenv
import os

load_dotenv()
host = os.getenv("UPSTASH_REDIS_HOST")
password = os.getenv("UPSTASH_REDIS_REST_TOKEN")

redis_db = redis.Redis(
  host=host,
  port=6379,
  password=password,
  ssl=True
)

