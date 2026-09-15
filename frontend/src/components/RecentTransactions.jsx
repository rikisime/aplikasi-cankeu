import { getIcon, COLOR_HEX } from "../lib/icons";
import { formatRupiah, formatDateID } from "../lib/format";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function RecentTransactions({ transactions = [], onItemClick }) {
  return (
    <div className="rounded-2xl border bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm h-full">
      <h3 className="text-lg font-heading font-semibold text-slate-900 dark:text-white mb-4">Transaksi Terbaru</h3>
      <div data-testid="recent-transactions-list" className="space-y-1 max-h-[340px] overflow-y-auto">
        {transactions.length === 0 && <p className="text-sm text-slate-400 text-center py-8">Belum ada transaksi</p>}
        {transactions.map((tx) => {
          const Icon = getIcon(tx.category_icon);
          const isIncome = tx.type === "income";
          const hex = COLOR_HEX[tx.category_color] || "#64748b";
          return (
            <button
              key={tx.id}
              onClick={() => onItemClick?.(tx)}
              data-testid={`transaction-item-${tx.id}`}
              className="w-full flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-left"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${hex}1A`, color: hex }}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{tx.category_name}</p>
                <p className="text-xs text-slate-400">
                  {formatDateID(tx.date)}
                  {tx.description ? ` · ${tx.description}` : ""}
                </p>
              </div>
              <div
                className={`flex items-center gap-1 text-sm font-mono font-semibold flex-shrink-0 ${
                  isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {isIncome ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {formatRupiah(tx.amount)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
