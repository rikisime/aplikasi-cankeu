from fastapi import APIRouter, Depends, HTTPException
from database import db
from models import User, Transaction, TransactionCreate, TransactionUpdate
from auth import get_current_user
from typing import Optional

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("")
async def list_transactions(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    type: Optional[str] = None,
    category_id: Optional[str] = None,
    user: User = Depends(get_current_user),
):
    query = {"user_id": user.user_id}
    if start_date and end_date:
        query["date"] = {"$gte": start_date, "$lte": end_date}
    if type:
        query["type"] = type
    if category_id:
        query["category_id"] = category_id
    txs = await db.transactions.find(query, {"_id": 0}).sort("date", -1).to_list(5000)
    return txs


@router.post("")
async def create_transaction(payload: TransactionCreate, user: User = Depends(get_current_user)):
    if payload.type not in ("income", "expense"):
        raise HTTPException(status_code=400, detail="Tipe transaksi tidak valid")
    category = await db.categories.find_one({"id": payload.category_id, "user_id": user.user_id}, {"_id": 0})
    if not category:
        raise HTTPException(status_code=404, detail="Kategori tidak ditemukan")
    tx = Transaction(
        user_id=user.user_id,
        type=payload.type,
        amount=payload.amount,
        category_id=payload.category_id,
        category_name=category["name"],
        category_icon=category["icon"],
        category_color=category["color"],
        date=payload.date,
        description=payload.description,
        payment_method=payload.payment_method,
    )
    doc = tx.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.transactions.insert_one({**doc})
    return doc


@router.put("/{transaction_id}")
async def update_transaction(transaction_id: str, payload: TransactionUpdate, user: User = Depends(get_current_user)):
    existing = await db.transactions.find_one({"id": transaction_id, "user_id": user.user_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Transaksi tidak ditemukan")
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if "category_id" in update_data:
        category = await db.categories.find_one({"id": update_data["category_id"], "user_id": user.user_id}, {"_id": 0})
        if not category:
            raise HTTPException(status_code=404, detail="Kategori tidak ditemukan")
        update_data["category_name"] = category["name"]
        update_data["category_icon"] = category["icon"]
        update_data["category_color"] = category["color"]
    await db.transactions.update_one({"id": transaction_id, "user_id": user.user_id}, {"$set": update_data})
    updated = await db.transactions.find_one({"id": transaction_id, "user_id": user.user_id}, {"_id": 0})
    return updated


@router.delete("/{transaction_id}")
async def delete_transaction(transaction_id: str, user: User = Depends(get_current_user)):
    result = await db.transactions.delete_one({"id": transaction_id, "user_id": user.user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Transaksi tidak ditemukan")
    return {"success": True}
