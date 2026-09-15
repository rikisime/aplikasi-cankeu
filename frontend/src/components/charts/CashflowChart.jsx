import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { formatRupiah } from "../../lib/format";

export default function CashflowChart({ data }) {
  return (
    <div
      className="rounded-2xl border bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm"
      data-testid="cashflow-chart"
    >
      <h3 className="text-lg font-heading font-semibold text-slate-900 dark:text-white mb-4">Arus Kas</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" tickLine={false} axisLine={false} minTickGap={25} />
          <YAxis
            tick={{ fontSize: 11 }}
            stroke="#94a3b8"
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}rb`}
          />
          <Tooltip
            formatter={(value, name) => [formatRupiah(value), name === "income" ? "Pemasukan" : "Pengeluaran"]}
            contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
          />
          <Area type="monotone" dataKey="income" stroke="#10B981" fill="url(#incomeGradient)" strokeWidth={2} />
          <Area type="monotone" dataKey="expense" stroke="#EF4444" fill="url(#expenseGradient)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
