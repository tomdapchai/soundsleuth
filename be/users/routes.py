from fastapi import APIRouter, Depends, HTTPException, status
from database.mongo_config import mongo
from verification.routes import oauth2_scheme, fake_users_db
from pymongo.mongo_client import MongoClient
from typing_extensions import Annotated
from pydantic import BaseModel
from utils.auth import verify_jwt_token

from jwt.exceptions import InvalidTokenError


class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

class User(BaseModel):
    username: str
    email: str | None = None
    full_name: str | None = None
    disabled: bool | None = None

class UserInDB(User):
    hashed_password: str

def get_user(db, username: str):
    if username in db:
        user_dict = db[username]
        return UserInDB(**user_dict)

def get_user(db, username: str):
    if username in db:
        user_dict = db[username]
        return UserInDB(**user_dict)

def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    credentails_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = verify_jwt_token(token)
        username: str = payload.get("sub")
        if username is None:
            raise credentails_exception
        token_data = TokenData(username=username)
    except InvalidTokenError:
        raise credentails_exception
    user = get_user(fake_users_db, username=token_data.username)
    if user is None:
        raise credentails_exception
    return user

async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


router = APIRouter()

@router.get("/users/me")
async def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user