from fastapi import APIRouter, Depends, HTTPException
from datetime import date, datetime, timedelta
from calendar import monthrange
from collections import OrderedDict
from database import db
from models import User
from auth import get_current_user

router = APIRouter(prefix="/reports", tags=["reports"])

MONTHS_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]


def daterange_labels(period: str, anchor: date):
    if period == "daily":
        start = anchor - timedelta(days=29)
        end = anchor
        buckets = OrderedDict()
        d = start
        while d <= end:
            buckets[d.isoformat()] = d.strftime("%d %b")
            d += timedelta(days=1)
        return start, end, buckets, "day"
    if period == "monthly":
        start = anchor.replace(day=1)
        last_day = monthrange(anchor.year, anchor.month)[1]
        end = anchor.replace(day=last_day)
        buckets = OrderedDict()
        d = start
        while d <= end:
            buckets[d.isoformat()] = str(d.day)
            d += timedelta(days=1)
        return start, end, buckets, "day"
    if period == "3months":
        end = anchor
        start_month = anchor.month - 2
        start_year = anchor.year
        while start_month <= 0:
            start_month += 12
            start_year -= 1
        start = date(start_year, start_month, 1)
        buckets = OrderedDict()
        d = start
        while d <= end:
            buckets[d.isoformat()] = d.strftime("%d %b")
            d += timedelta(days=1)
        return start, end, buckets, "day"
    if period == "yearly":
        start = date(anchor.year, 1, 1)
        end = date(anchor.year, 12, 31)
        buckets = OrderedDict()
        for m in range(1, 13):
            key = f"{anchor.year}-{m:02d}"
            buckets[key] = MONTHS_ID[m - 1]
        return start, end, buckets, "month"
    raise HTTPException(status_code=400, detail="Periode tidak valid")


@router.get("/summary")
async def report_summary(period: str = "monthly", anchor_date: str = None, user: User = Depends(get_current_user)):
    anchor = date.fromisoformat(anchor_date) if anchor_date else date.today()
    start, end, buckets, granularity = daterange_labels(period, anchor)

    txs = await db.transactions.find(
        {"user_id": user.user_id, "date": {"$gte": start.isoformat(), "$lte": end.isoformat()}},
        {"_id": 0},
    ).to_list(10000)

    chart_map = {}
    for key in buckets:
        chart_map[key] = {"income": 0.0, "expense": 0.0}

    total_income = 0.0
    total_expense = 0.0
    category_totals = {}

    for tx in txs:
        amount = tx["amount"]
        if granularity == "month":
            key = tx["date"][:7]
        else:
            key = tx["date"]
        if key in chart_map:
            chart_map[key][tx["type"]] += amount
        if tx["type"] == "income":
            total_income += amount
        else:
            total_expense += amount
            cat_key = tx["category_name"]
            if cat_key not in category_totals:
                category_totals[cat_key] = {"name": cat_key, "value": 0.0, "color": tx["category_color"], "icon": tx["category_icon"]}
            category_totals[cat_key]["value"] += amount

    chart_data = [
        {"label": buckets[key], "date": key, "income": round(chart_map[key]["income"], 2), "expense": round(chart_map[key]["expense"], 2)}
        for key in buckets
    ]

    net_balance = total_income - total_expense
    savings_rate = round((net_balance / total_income) * 100, 1) if total_income > 0 else 0.0

    return {
        "period": period,
        "start_date": start.isoformat(),
        "end_date": end.isoformat(),
        "total_income": round(total_income, 2),
        "total_expense": round(total_expense, 2),
        "net_balance": round(net_balance, 2),
        "savings_rate": savings_rate,
        "transaction_count": len(txs),
        "chart_data": chart_data,
        "category_breakdown": sorted(category_totals.values(), key=lambda x: x["value"], reverse=True),
    }
