import os
import uuid
from datetime import datetime, timezone, timedelta
import pytest
import requests
from pymongo import MongoClient
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent.parent / ".env")

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") if os.environ.get("REACT_APP_BACKEND_URL") else "https://money-flow-dashboard-8.preview.emergentagent.com"
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]


def _make_user(prefix="TEST"):
    mc = MongoClient(MONGO_URL)
    db = mc[DB_NAME]
    uid = f"{prefix}_user_{uuid.uuid4().hex[:8]}"
    token = f"{prefix}_tok_{uuid.uuid4().hex}"
    db.users.insert_one({
        "user_id": uid,
        "email": f"{uid}@example.com",
        "name": f"Test {uid}",
        "picture": None,
        "accent_color": "ocean_blue",
        "theme_mode": "light",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    db.user_sessions.insert_one({
        "user_id": uid,
        "session_token": token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc),
    })
    return uid, token, db


@pytest.fixture(scope="session")
def base_url():
    return BASE_URL


@pytest.fixture(scope="session")
def user_a():
    uid, token, db = _make_user("TESTA")
    yield {"user_id": uid, "token": token}
    db.transactions.delete_many({"user_id": uid})
    db.categories.delete_many({"user_id": uid})
    db.user_sessions.delete_many({"user_id": uid})
    db.users.delete_one({"user_id": uid})


@pytest.fixture(scope="session")
def user_b():
    uid, token, db = _make_user("TESTB")
    yield {"user_id": uid, "token": token}
    db.transactions.delete_many({"user_id": uid})
    db.categories.delete_many({"user_id": uid})
    db.user_sessions.delete_many({"user_id": uid})
    db.users.delete_one({"user_id": uid})


@pytest.fixture
def client_a(user_a):
    s = requests.Session()
    s.headers.update({"Authorization": f"Bearer {user_a['token']}", "Content-Type": "application/json"})
    return s


@pytest.fixture
def client_b(user_b):
    s = requests.Session()
    s.headers.update({"Authorization": f"Bearer {user_b['token']}", "Content-Type": "application/json"})
    return s
