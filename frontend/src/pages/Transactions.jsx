import { useState } from "react";
import useSWR from "swr";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import { getIcon, COLOR_HEX } from "../lib/icons";
import { formatRupiah, formatDateID } from "../lib/format";
import TransactionModal from "../components/TransactionModal";
import { Button } from "../components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";

const fetcher = (url) => api.get(url).then((res) => res.data);

export default function Transactions() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  const { data: transactions, mutate } = useSWR("/transactions", fetcher);
  const { data: categories } = useSWR("/categories", fetcher);

  const filtered = (transactions || []).filter((tx) => typeFilter === "all" || tx.type === typeFilter);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      toast.success("Transaksi dihapus");
      mutate();
    } catch (e) {
      toast.error("Gagal menghapus transaksi");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-white">Transaksi</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Semua catatan uang masuk dan keluar.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger data-testid="transaction-type-filter" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="income">Pemasukan</SelectItem>
              <SelectItem value="expense">Pengeluaran</SelectItem>
            </SelectContent>
          </Select>
          <Button
            data-testid="add-transaction-button"
            onClick={() => {
              setEditingTx(null);
              setModalOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" /> Transaksi
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-16">Belum ada transaksi</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse" data-testid="transactions-table">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Catatan</th>
                  <th className="py-3 px-4">Metode</th>
                  <th className="py-3 px-4 text-right">Jumlah</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => {
                  const Icon = getIcon(tx.category_icon);
                  const isIncome = tx.type === "income";
                  const hex = COLOR_HEX[tx.category_color] || "#64748b";
                  return (
                    <tr
                      key={tx.id}
                      data-testid={`transaction-row-${tx.id}`}
                      className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">{formatDateID(tx.date)}</td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                          <span
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${hex}1A`, color: hex }}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </span>
                          {tx.category_name}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 max-w-[200px] truncate">
                        {tx.description || "-"}
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 capitalize">{tx.payment_method}</td>
                      <td
                        className={`py-3 px-4 text-right font-mono font-semibold whitespace-nowrap ${
                          isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {isIncome ? "+" : "-"} {formatRupiah(tx.amount)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            data-testid={`edit-transaction-${tx.id}`}
                            onClick={() => {
                              setEditingTx(tx);
                              setModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                data-testid={`delete-transaction-${tx.id}`}
                                className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus transaksi ini?</AlertDialogTitle>
                                <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  data-testid={`confirm-delete-transaction-${tx.id}`}
                                  onClick={() => handleDelete(tx.id)}
                                  className="bg-rose-600 hover:bg-rose-700"
                                >
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TransactionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        categories={categories}
        editingTransaction={editingTx}
        onSaved={() => {
          mutate();
          setEditingTx(null);
        }}
      />
    </div>
  );
}
