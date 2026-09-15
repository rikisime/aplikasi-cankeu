import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { Button } from "./ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { getIcon } from "../lib/icons";
import { api } from "../lib/api";
import { toast } from "sonner";

const PAYMENT_METHODS = [
  { value: "cash", label: "Tunai" },
  { value: "bank", label: "Bank" },
  { value: "ewallet", label: "E-Wallet" },
];

export default function TransactionModal({ open, onOpenChange, categories, onSaved, editingTransaction }) {
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(new Date());
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(String(editingTransaction.amount));
      setCategoryId(editingTransaction.category_id);
      setDate(new Date(editingTransaction.date));
      setDescription(editingTransaction.description || "");
      setPaymentMethod(editingTransaction.payment_method || "cash");
    } else if (open) {
      setType("expense");
      setAmount("");
      setCategoryId("");
      setDate(new Date());
      setDescription("");
      setPaymentMethod("cash");
    }
  }, [editingTransaction, open]);

  const filteredCategories = (categories || []).filter((c) => c.type === type);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.error("Masukkan jumlah yang valid");
      return;
    }
    if (!categoryId) {
      toast.error("Pilih kategori");
      return;
    }
    setSaving(true);
    const payload = {
      type,
      amount: Number(amount),
      category_id: categoryId,
      date: format(date, "yyyy-MM-dd"),
      description,
      payment_method: paymentMethod,
    };
    try {
      if (editingTransaction) {
        await api.put(`/transactions/${editingTransaction.id}`, payload);
        toast.success("Transaksi berhasil diperbarui");
      } else {
        await api.post("/transactions", payload);
        toast.success(type === "income" ? "Pemasukan berhasil ditambahkan" : "Pengeluaran berhasil ditambahkan");
      }
      onSaved?.();
      onOpenChange(false);
    } catch (err) {
      toast.error("Gagal menyimpan transaksi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="transaction-form-modal" className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading">{editingTransaction ? "Ubah Transaksi" : "Transaksi Baru"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-2">
          <button
            type="button"
            data-testid="transaction-type-tab-expense"
            onClick={() => {
              setType("expense");
              setCategoryId("");
            }}
            className={`py-2 rounded-lg text-sm font-medium transition-all ${
              type === "expense" ? "bg-rose-600 text-white shadow-sm" : "text-slate-500"
            }`}
          >
            Pengeluaran
          </button>
          <button
            type="button"
            data-testid="transaction-type-tab-income"
            onClick={() => {
              setType("income");
              setCategoryId("");
            }}
            className={`py-2 rounded-lg text-sm font-medium transition-all ${
              type === "income" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-500"
            }`}
          >
            Pemasukan
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Jumlah (Rp)</Label>
            <Input
              data-testid="transaction-amount-input"
              type="number"
              min="0"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Kategori</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger data-testid="transaction-category-select">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((c) => {
                  const Icon = getIcon(c.icon);
                  return (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="flex items-center gap-2">
                        <Icon className="w-4 h-4" /> {c.name}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tanggal</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    data-testid="transaction-date-picker"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {format(date, "dd MMM yyyy", { locale: idLocale })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label>Metode</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger data-testid="transaction-payment-method-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Catatan (opsional)</Label>
            <Textarea
              data-testid="transaction-description-input"
              placeholder="Contoh: Makan siang di warung"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <Button type="submit" data-testid="save-transaction-submit-button" disabled={saving} className="w-full">
            {saving ? "Menyimpan..." : "Simpan Transaksi"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
