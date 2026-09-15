import requests


# --- Health ---
def test_root(base_url):
    r = requests.get(f"{base_url}/api/")
    assert r.status_code == 200
    assert r.json().get("message") == "ArthaKu API"


# --- Auth ---
def test_auth_me_no_token(base_url):
    r = requests.get(f"{base_url}/api/auth/me")
    assert r.status_code == 401


def test_auth_me_invalid_token(base_url):
    r = requests.get(f"{base_url}/api/auth/me", headers={"Authorization": "Bearer invalidxxx"})
    assert r.status_code == 401


def test_auth_me_valid(base_url, client_a, user_a):
    r = client_a.get(f"{base_url}/api/auth/me")
    assert r.status_code == 200
    data = r.json()
    assert data["user_id"] == user_a["user_id"]
    assert "email" in data


def test_auth_theme_update(base_url, client_a):
    r = client_a.put(f"{base_url}/api/auth/theme", json={"accent_color": "emerald_green", "theme_mode": "dark"})
    assert r.status_code == 200
    d = r.json()
    assert d["accent_color"] == "emerald_green"
    assert d["theme_mode"] == "dark"
    # persist verify
    me = client_a.get(f"{base_url}/api/auth/me").json()
    assert me["accent_color"] == "emerald_green"


# --- Categories: auto-seed & CRUD ---
def test_categories_autoseed(base_url, client_a):
    r = client_a.get(f"{base_url}/api/categories")
    assert r.status_code == 200
    cats = r.json()
    assert len(cats) == 12
    assert sum(1 for c in cats if c["type"] == "expense" and c["is_default"]) == 8
    assert sum(1 for c in cats if c["type"] == "income" and c["is_default"]) == 4


def test_categories_no_reseed(base_url, client_a):
    client_a.get(f"{base_url}/api/categories")
    r2 = client_a.get(f"{base_url}/api/categories")
    assert len([c for c in r2.json() if c["is_default"]]) == 12


def test_create_custom_category_and_delete(base_url, client_a):
    r = client_a.post(f"{base_url}/api/categories", json={"name": "TEST_Kopi", "type": "expense", "icon": "Coffee", "color": "amber"})
    assert r.status_code == 200
    cat = r.json()
    assert cat["name"] == "TEST_Kopi"
    assert cat["is_default"] is False
    cat_id = cat["id"]

    # verify persisted
    all_cats = client_a.get(f"{base_url}/api/categories").json()
    assert any(c["id"] == cat_id for c in all_cats)

    # delete custom
    r = client_a.delete(f"{base_url}/api/categories/{cat_id}")
    assert r.status_code == 200
    all_cats = client_a.get(f"{base_url}/api/categories").json()
    assert not any(c["id"] == cat_id for c in all_cats)


def test_delete_default_category_forbidden(base_url, client_a):
    cats = client_a.get(f"{base_url}/api/categories").json()
    default_cat = next(c for c in cats if c["is_default"])
    r = client_a.delete(f"{base_url}/api/categories/{default_cat['id']}")
    assert r.status_code == 400


def test_create_category_invalid_type(base_url, client_a):
    r = client_a.post(f"{base_url}/api/categories", json={"name": "TEST_x", "type": "bogus"})
    assert r.status_code == 400


# --- Transactions ---
def test_transaction_crud_flow(base_url, client_a):
    cats = client_a.get(f"{base_url}/api/categories").json()
    expense_cat = next(c for c in cats if c["type"] == "expense")

    # Create
    payload = {
        "type": "expense",
        "amount": 50000,
        "category_id": expense_cat["id"],
        "date": "2026-01-10",
        "description": "TEST_makan siang",
        "payment_method": "cash",
    }
    r = client_a.post(f"{base_url}/api/transactions", json=payload)
    assert r.status_code == 200
    tx = r.json()
    assert tx["amount"] == 50000
    assert tx["category_name"] == expense_cat["name"]
    tx_id = tx["id"]

    # List
    txs = client_a.get(f"{base_url}/api/transactions").json()
    assert any(t["id"] == tx_id for t in txs)

    # Filter by type
    r = client_a.get(f"{base_url}/api/transactions?type=expense")
    assert r.status_code == 200
    assert all(t["type"] == "expense" for t in r.json())

    # Filter by date range
    r = client_a.get(f"{base_url}/api/transactions?start_date=2026-01-01&end_date=2026-01-31")
    assert r.status_code == 200
    assert any(t["id"] == tx_id for t in r.json())

    # Filter by category
    r = client_a.get(f"{base_url}/api/transactions?category_id={expense_cat['id']}")
    assert r.status_code == 200
    assert any(t["id"] == tx_id for t in r.json())

    # Update
    r = client_a.put(f"{base_url}/api/transactions/{tx_id}", json={"amount": 75000, "description": "TEST_updated"})
    assert r.status_code == 200
    assert r.json()["amount"] == 75000
    assert r.json()["description"] == "TEST_updated"

    # Delete
    r = client_a.delete(f"{base_url}/api/transactions/{tx_id}")
    assert r.status_code == 200
    txs = client_a.get(f"{base_url}/api/transactions").json()
    assert not any(t["id"] == tx_id for t in txs)


def test_transaction_invalid_category(base_url, client_a):
    r = client_a.post(f"{base_url}/api/transactions", json={
        "type": "expense", "amount": 100, "category_id": "nonexistent",
        "date": "2026-01-01", "description": "", "payment_method": "cash",
    })
    assert r.status_code == 404


def test_transaction_invalid_type(base_url, client_a):
    cats = client_a.get(f"{base_url}/api/categories").json()
    r = client_a.post(f"{base_url}/api/transactions", json={
        "type": "bogus", "amount": 100, "category_id": cats[0]["id"],
        "date": "2026-01-01",
    })
    assert r.status_code == 400


# --- Reports ---
def test_reports_summary_periods(base_url, client_a):
    cats = client_a.get(f"{base_url}/api/categories").json()
    exp = next(c for c in cats if c["type"] == "expense")
    inc = next(c for c in cats if c["type"] == "income")

    from datetime import date
    today = date.today().isoformat()
    client_a.post(f"{base_url}/api/transactions", json={
        "type": "income", "amount": 1000000, "category_id": inc["id"], "date": today, "description": "TEST_inc",
    })
    client_a.post(f"{base_url}/api/transactions", json={
        "type": "expense", "amount": 250000, "category_id": exp["id"], "date": today, "description": "TEST_exp",
    })

    for period in ["daily", "monthly", "3months", "yearly"]:
        r = client_a.get(f"{base_url}/api/reports/summary?period={period}")
        assert r.status_code == 200, f"Failed for {period}: {r.text}"
        d = r.json()
        assert "total_income" in d and "total_expense" in d and "net_balance" in d
        assert "savings_rate" in d
        assert "chart_data" in d and isinstance(d["chart_data"], list)
        assert "category_breakdown" in d

    # invalid period
    r = client_a.get(f"{base_url}/api/reports/summary?period=weekly")
    assert r.status_code == 400


# --- Export ---
def test_export_excel(base_url, client_a):
    r = client_a.get(f"{base_url}/api/export/excel?period=monthly")
    assert r.status_code == 200
    assert "spreadsheetml" in r.headers.get("content-type", "")
    assert len(r.content) > 100


def test_export_pdf(base_url, client_a):
    r = client_a.get(f"{base_url}/api/export/pdf?period=monthly")
    assert r.status_code == 200
    assert "application/pdf" in r.headers.get("content-type", "")
    assert r.content.startswith(b"%PDF")


# --- Data isolation ---
def test_user_data_isolation(base_url, client_a, client_b, user_a, user_b):
    # Seed categories for both users
    cats_a = client_a.get(f"{base_url}/api/categories").json()
    cats_b = client_b.get(f"{base_url}/api/categories").json()

    # user A creates a transaction
    exp_a = next(c for c in cats_a if c["type"] == "expense")
    r = client_a.post(f"{base_url}/api/transactions", json={
        "type": "expense", "amount": 12345, "category_id": exp_a["id"],
        "date": "2026-01-15", "description": "TEST_isolation_a",
    })
    assert r.status_code == 200
    tx_a_id = r.json()["id"]

    # user B must NOT see it
    txs_b = client_b.get(f"{base_url}/api/transactions").json()
    assert not any(t["id"] == tx_a_id for t in txs_b)

    # user B cannot delete user A's tx
    r = client_b.delete(f"{base_url}/api/transactions/{tx_a_id}")
    assert r.status_code == 404

    # user B cannot use user A's category
    r = client_b.post(f"{base_url}/api/transactions", json={
        "type": "expense", "amount": 100, "category_id": exp_a["id"],
        "date": "2026-01-15",
    })
    assert r.status_code == 404


# --- Logout ---
def test_logout_clears_session(base_url, user_a):
    # Create fresh session for this test to not disturb other tests
    from conftest import _make_user
    uid, token, db = _make_user("TESTL")
    s = requests.Session()
    s.headers.update({"Authorization": f"Bearer {token}"})
    r = s.get(f"{base_url}/api/auth/me")
    assert r.status_code == 200
    r = s.post(f"{base_url}/api/auth/logout")
    assert r.status_code == 200
    r = s.get(f"{base_url}/api/auth/me")
    assert r.status_code == 401
    # cleanup
    db.users.delete_one({"user_id": uid})
    db.user_sessions.delete_many({"user_id": uid})
