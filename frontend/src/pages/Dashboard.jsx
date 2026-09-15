import { useState } from "react";
import useSWR from "swr";
import { Plus } from "lucide-react";
import { api } from "../lib/api";
import PeriodSelector from "../components/PeriodSelector";
import SummaryCards from "../components/SummaryCards";
import CashflowChart from "../components/charts/CashflowChart";
import CategoryPieChart from "../components/charts/CategoryPieChart";
import RecentTransactions from "../components/RecentTransactions";
import TransactionModal from "../components/TransactionModal";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";

const fetcher = (url) => api.get(url).then((res) => res.data);

export default function Dashboard() {
  const { user } = useAuth();
  const [period, setPeriod] = useState("monthly");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  const { data: summary, mutate: mutateSummary } = useSWR(`/reports/summary?period=${period}`, fetcher);
  const { data: categories } = useSWR("/categories", fetcher);
  const { data: transactions, mutate: mutateTx } = useSWR("/transactions", fetcher);

  const recent = (transactions || []).slice(0, 8);

  const handleSaved = () => {
    mutateSummary();
    mutateTx();
    setEditingTx(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-white">
            Halo, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Ini ringkasan keuanganmu.</p>
        </div>
        <div className="flex items-center gap-3">
          <PeriodSelector value={period} onChange={setPeriod} />
          <Button
            data-testid="add-transaction-button"
            onClick={() => {
              setEditingTx(null);
              setModalOpen(true);
            }}
            className="gap-2 flex-shrink-0"
          >
            <Plus className="w-4 h-4" /> Transaksi
          </Button>
        </div>
      </div>

      <SummaryCards summary={summary} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CashflowChart data={summary?.chart_data || []} />
        </div>
        <div className="lg:col-span-1">
          <CategoryPieChart data={summary?.category_breakdown || []} />
        </div>
      </div>

      <RecentTransactions
        transactions={recent}
        onItemClick={(tx) => {
          setEditingTx(tx);
          setModalOpen(true);
        }}
      />

      <TransactionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        categories={categories}
        editingTransaction={editingTx}
        onSaved={handleSaved}
      />
    </div>
  );
}
