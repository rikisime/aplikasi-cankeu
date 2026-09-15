import os
import uuid
import httpx
from datetime import datetime, timezone, timedelta
from fastapi import Request, HTTPException, Depends
from database import db
from models import User

EMERGENT_SESSION_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"


async def exchange_session_id(session_id: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.get(EMERGENT_SESSION_URL, headers={"X-Session-ID": session_id}, timeout=15)
    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Sesi login tidak valid")
    return resp.json()


async def create_session_for_user(user_id: str, session_token: str):
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc),
    })


async def get_or_create_user(session_data: dict) -> User:
    email = session_data["email"]
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        return User(**existing)
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user = User(
        user_id=user_id,
        email=email,
        name=session_data.get("name", email.split("@")[0]),
        picture=session_data.get("picture"),
    )
    doc = user.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.users.insert_one(doc)
    return user


async def get_current_user(request: Request) -> User:
    token = request.cookies.get("session_token")
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1]
    if not token:
        raise HTTPException(status_code=401, detail="Belum login")

    session_doc = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Sesi tidak ditemukan")

    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Sesi telah berakhir")

    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Pengguna tidak ditemukan")
    return User(**user_doc)
