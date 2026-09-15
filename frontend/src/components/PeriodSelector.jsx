const PERIODS = [
  { value: "daily", label: "Harian", testid: "period-filter-daily" },
  { value: "monthly", label: "Bulanan", testid: "period-filter-monthly" },
  { value: "3months", label: "3 Bulan", testid: "period-filter-3months" },
  { value: "yearly", label: "Tahunan", testid: "period-filter-yearly" },
];

export default function PeriodSelector({ value, onChange }) {
  return (
    <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl gap-1 flex-wrap">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          data-testid={p.testid}
          onClick={() => onChange(p.value)}
          className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
            value === p.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
