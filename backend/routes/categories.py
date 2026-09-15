from fastapi import APIRouter, Depends, HTTPException
from database import db
from models import User, Category, CategoryCreate
from seed_data import DEFAULT_CATEGORIES
from auth import get_current_user

router = APIRouter(prefix="/categories", tags=["categories"])


async def ensure_default_categories(user_id: str):
    existing = await db.categories.count_documents({"user_id": user_id, "is_default": True})
    if existing > 0:
        return
    docs = []
    for c in DEFAULT_CATEGORIES:
        cat = Category(user_id=user_id, is_default=True, **c)
        doc = cat.model_dump()
        doc["created_at"] = doc["created_at"].isoformat()
        docs.append(doc)
    if docs:
        await db.categories.insert_many(docs)


@router.get("")
async def list_categories(user: User = Depends(get_current_user)):
    await ensure_default_categories(user.user_id)
    cats = await db.categories.find({"user_id": user.user_id}, {"_id": 0}).to_list(1000)
    return cats


@router.post("")
async def create_category(payload: CategoryCreate, user: User = Depends(get_current_user)):
    if payload.type not in ("income", "expense"):
        raise HTTPException(status_code=400, detail="Tipe kategori tidak valid")
    cat = Category(user_id=user.user_id, is_default=False, **payload.model_dump())
    doc = cat.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.categories.insert_one({**doc})
    return doc


@router.delete("/{category_id}")
async def delete_category(category_id: str, user: User = Depends(get_current_user)):
    cat = await db.categories.find_one({"id": category_id, "user_id": user.user_id}, {"_id": 0})
    if not cat:
        raise HTTPException(status_code=404, detail="Kategori tidak ditemukan")
    if cat.get("is_default"):
        raise HTTPException(status_code=400, detail="Kategori bawaan tidak dapat dihapus")
    await db.categories.delete_one({"id": category_id, "user_id": user.user_id})
    return {"success": True}
