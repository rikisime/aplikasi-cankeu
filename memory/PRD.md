# ArthaKu - Pencatat Keuangan Harian

## Original Problem Statement
Pencatat keuangan harian, dengan sistem yang modern, UI yang modern, warna kombinasi biru hijau merah. Uang keluar masuk. Laporan harian, bulanan, 3 bulan, tahunan dalam bentuk grafis. Untuk masuk memerlukan akun login, bisa digunakan untuk orang lain juga (multi-user, tampilan per akun berbeda-beda).

## User Choices Gathered
- Login: Google (Emergent-managed Google OAuth, real)
- Categories: default + custom (user-created)
- Features: basic (record transactions + graphical reports) + PDF/Excel export
- Personalization: each user has own data + own theme (accent color + light/dark)
- Currency: IDR (Rp) only

## Architecture
- Backend: FastAPI + MongoDB (motor), modular routes (`auth.py`, `routes/categories.py`, `routes/transactions.py`, `routes/reports.py`, `routes/export.py`)
- Auth: Emergent-managed Google OAuth (session_id exchange -> httpOnly cookie session_token, 7-day expiry), custom `user_id` (uuid) pattern, no ObjectId leakage
- Frontend: React + Tailwind + Shadcn UI, recharts for graphs, SWR for data fetching, framer-motion for animations
- Export: server-side PDF (reportlab) and Excel (openpyxl) generation, streamed as file download

## User Personas
- Individual users tracking personal daily income/expense in Rupiah, each with isolated data and their own visual theme (accent color: Samudra Blue / Zamrud Green / Delima Red / Malam Dark, plus light/dark mode).

## Core Requirements (static)
1. Google login required to access the app
2. Record income (pemasukan) and expense (pengeluaran) transactions with amount, category, date, description, payment method
3. Default categories (12) + user custom categories (name, type, icon, color)
4. Graphical reports for daily/monthly/3-month/yearly periods: cashflow area chart, category breakdown pie chart, KPI summary (income, expense, balance, savings rate)
5. Export reports to PDF and Excel
6. Per-user theme personalization (accent color + light/dark mode), persisted server-side

## What's Been Implemented (2026-07)
- Full MVP built and tested end-to-end (backend 18/18 pytest pass, frontend critical flows verified)
- Real Google OAuth flow (login, session exchange, protected routes, logout)
- Categories: auto-seeded defaults per user + custom category CRUD (default categories protected from deletion)
- Transactions: full CRUD with type/date/category filters
- Reports: /api/reports/summary for all 4 periods with chart_data + category_breakdown
- Export: PDF (reportlab) and Excel (openpyxl) downloads
- Theme personalization: 4 accent colors + light/dark mode, persisted via PUT /api/auth/theme
- Dashboard, Transactions, Reports, Settings pages with sidebar navigation, mobile responsive (Sheet drawer)
- Data isolation verified between users

## Known Minor Issues
- Radix Dialog missing aria-describedby (a11y console warning only, not functional/blocking)

## Prioritized Backlog / P1-P2 Features Remaining
- P1: Budget/target per category with over-budget alerts
- P1: Recurring transactions (e.g. monthly salary auto-entry)
- P2: Multi-currency support
- P2: Shared/family accounts (multiple users viewing same ledger)
- P2: Push/email notifications for spending alerts

## Next Tasks
- Await user feedback on MVP before building backlog items
