from database.mongo_config import mongo
from auth.password import get_password_hash
import os

def init_users():
    # Check if test user exists
    if not mongo["users"].find_one({"username": "johndoe"}):
        print("Creating test user...")
        test_user = {
            "username": "johndoe",
            "full_name": "John Doe",
            "email": "johndoe@example.com",
            "hashed_password": get_password_hash("secret"),
            "disabled": False,
        }
        mongo["users"].insert_one(test_user)
        print("Test user initialized")
    else:
        print("Test user already exists")

if __name__ == "__main__":
    init_users()
