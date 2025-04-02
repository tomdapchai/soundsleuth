from fastapi import APIRouter, HTTPException, Depends, status
from typing_extensions import Annotated
from database.mongo_config import mongo
from pydantic import BaseModel
from auth.users import get_current_active_user, User
from auth.password import get_password_hash

class UserCreate(BaseModel):
    username: str
    email: str
    full_name: str | None = None
    password: str

router = APIRouter()

@router.get("/me", response_model=User)
async def read_users_me(current_user: Annotated[User, Depends(get_current_active_user)]):
    return current_user

@router.post("/register", response_model=User)
async def register_user(user_data: UserCreate):
    # Check if username exists
    if mongo["users"].find_one({"username": user_data.username}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Create new user with hashed password
    user_dict = user_data.dict()
    hashed_password = get_password_hash(user_dict.pop("password"))
    
    new_user = {
        **user_dict,
        "hashed_password": hashed_password,
        "disabled": False
    }
    
    result = mongo["users"].insert_one(new_user)
    
    if not result.acknowledged:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register user"
        )
    
    return User(**new_user)