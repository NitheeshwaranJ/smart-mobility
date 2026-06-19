from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import SignupIn, LoginIn, TokenOut, UserOut
from ..core.security import hash_password, verify_password, create_access_token, current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=TokenOut)
def signup(data: SignupIn, db: Session = Depends(get_db)):
    if db.scalar(select(User).where(User.email == data.email)):
        raise HTTPException(409, "Email already registered")
    u = User(
        name=data.name, email=data.email,
        password_hash=hash_password(data.password),
        role=data.role, phone=data.phone,
    )
    db.add(u); db.commit(); db.refresh(u)
    token = create_access_token(u.id, u.role.value)
    return TokenOut(access_token=token, user=UserOut.model_validate(u))


@router.post("/login", response_model=TokenOut)
def login(data: LoginIn, db: Session = Depends(get_db)):
    u = db.scalar(select(User).where(User.email == data.email))
    if not u or not verify_password(data.password, u.password_hash):
        raise HTTPException(401, "Invalid credentials")
    token = create_access_token(u.id, u.role.value)
    return TokenOut(access_token=token, user=UserOut.model_validate(u))


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(current_user)):
    return user
