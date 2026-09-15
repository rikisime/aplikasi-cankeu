import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { formatRupiah } from "../lib/format";

export default function SummaryCards({ summary }) {
  const cards = [
    {
      testid: "balance-summary-card",
      label: "Saldo Bersih",
      value: summary?.net_balance ?? 0,
      icon: Wallet,
      accent: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      testid: "income-summary-card",
      label: "Total Pemasukan",
      value: summary?.total_income ?? 0,
      icon: TrendingUp,
      accent: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      testid: "expense-summary-card",
      label: "Total Pengeluaran",
      value: summary?.total_expense ?? 0,
      icon: TrendingDown,
      accent: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((c) => (
        <div
          key={c.testid}
          data-testid={c.testid}
          className="rounded-2xl border bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all"
        >
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${c.accent}`}>
            <c.icon className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{c.label}</p>
          <p className="text-2xl font-heading font-bold text-slate-900 dark:text-white font-mono tracking-tight">
            {formatRupiah(c.value)}
          </p>
        </div>
      ))}
      <div
        data-testid="savings-rate-card"
        className="rounded-2xl border bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all"
      >
        <div className="w-10 h-10 rounded-xl border flex items-center justify-center mb-4 text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20">
          <TrendingUp className="w-5 h-5" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Tingkat Hemat</p>
        <p className="text-2xl font-heading font-bold text-slate-900 dark:text-white font-mono tracking-tight">
          {summary?.savings_rate ?? 0}%
        </p>
      </div>
    </div>
  );
}
