from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing_extensions import Annotated
from pydantic import BaseModel
from fastapi.responses import RedirectResponse

from auth.jwt import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from auth.users import authenticate_user, get_user

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginForm(BaseModel):
    username: str
    password: str

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(form_data: LoginForm):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, 
        expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")

@router.post("/loginTest", response_model=Token)
async def login_test(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, 
        expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")

@router.get("/quick-token", response_model=Token, 
            summary="Get JWT token for quick testing",
            description="Generates a valid JWT token for the test user 'johndoe' without requiring login credentials. Use this for quick API testing in the docs.")
async def get_quick_token():
    """
    Quick authentication endpoint that returns a valid JWT token for testing.
    This allows you to quickly get authorized in the Swagger docs without going through the login form.
    """
    test_username = "johndoe"
    user = get_user(test_username)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test user not found. Please run the init_db.py script first."
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires
    )
    
    return Token(access_token=access_token, token_type="bearer")
