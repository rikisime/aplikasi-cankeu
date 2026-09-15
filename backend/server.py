import logging
import secrets
from pathlib import Path

from fastapi import FastAPI, APIRouter, Depends, Response
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from database import db, client
from models import User, ThemeUpdate
from auth import exchange_google_code, get_or_create_user, create_session_for_user, get_current_user
from routes import categories, transactions, reports, export

app = FastAPI()
api_router = APIRouter(prefix="/api")


class GoogleAuthRequest(BaseModel):
    code: str


@api_router.get("/")
async def root():
    return {"message": "ArthaKu API"}


@api_router.post("/auth/google")
async def auth_google(payload: GoogleAuthRequest, response: Response):
    session_data = await exchange_google_code(payload.code)
    user = await get_or_create_user(session_data)
    session_token = secrets.token_hex(32)
    await create_session_for_user(user.user_id, session_token)
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60,
    )
    return user


@api_router.get("/auth/me")
async def auth_me(user: User = Depends(get_current_user)):
    return user


@api_router.put("/auth/theme")
async def update_theme(payload: ThemeUpdate, user: User = Depends(get_current_user)):
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if update_data:
        await db.users.update_one({"user_id": user.user_id}, {"$set": update_data})
    updated = await db.users.find_one({"user_id": user.user_id}, {"_id": 0})
    return updated


@api_router.post("/auth/logout")
async def logout(response: Response, request_user: User = Depends(get_current_user)):
    await db.user_sessions.delete_many({"user_id": request_user.user_id})
    response.delete_cookie("session_token", path="/")
    return {"success": True}


api_router.include_router(categories.router)
api_router.include_router(transactions.router)
api_router.include_router(reports.router)
api_router.include_router(export.router)

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origin_regex=".*",
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
