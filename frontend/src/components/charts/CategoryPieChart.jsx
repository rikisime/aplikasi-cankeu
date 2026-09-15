import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { COLOR_HEX, getIcon } from "../../lib/icons";
import { formatRupiah } from "../../lib/format";

export default function CategoryPieChart({ data }) {
  const hasData = data && data.length > 0;
  return (
    <div
      className="rounded-2xl border bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm"
      data-testid="category-pie-chart"
    >
      <h3 className="text-lg font-heading font-semibold text-slate-900 dark:text-white mb-4">Pengeluaran per Kategori</h3>
      {hasData ? (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={COLOR_HEX[entry.color] || "#64748b"} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatRupiah(value)} contentStyle={{ borderRadius: 12, fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
            {data.map((entry, i) => {
              const Icon = getIcon(entry.icon);
              return (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLOR_HEX[entry.color] || "#64748b" }}
                    />
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{entry.name}</span>
                  </span>
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200 flex-shrink-0">
                    {formatRupiah(entry.value)}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">Belum ada data pengeluaran</div>
      )}
    </div>
  );
}
