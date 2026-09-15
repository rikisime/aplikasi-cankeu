import { useState } from "react";
import useSWR from "swr";
import { Sun, Moon, Plus, Trash2, Check } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useTheme, ACCENTS } from "../context/ThemeContext";
import { getIcon, ICON_OPTIONS, COLOR_HEX, COLOR_OPTIONS } from "../lib/icons";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { toast } from "sonner";

const fetcher = (url) => api.get(url).then((res) => res.data);

export default function Settings() {
  const { user } = useAuth();
  const { accent, mode, setAccent, setMode } = useTheme();
  const { data: categories, mutate } = useSWR("/categories", fetcher);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatType, setNewCatType] = useState("expense");
  const [newCatIcon, setNewCatIcon] = useState(ICON_OPTIONS[0]);
  const [newCatColor, setNewCatColor] = useState(COLOR_OPTIONS[0]);

  const handleAddCategory = async () => {
    if (!newCatName.trim()) {
      toast.error("Nama kategori tidak boleh kosong");
      return;
    }
    try {
      await api.post("/categories", { name: newCatName, type: newCatType, icon: newCatIcon, color: newCatColor });
      toast.success("Kategori berhasil ditambahkan");
      setNewCatName("");
      setCatModalOpen(false);
      mutate();
    } catch (e) {
      toast.error("Gagal menambahkan kategori");
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      toast.success("Kategori dihapus");
      mutate();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Gagal menghapus kategori");
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-white">Pengaturan</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Personalisasi tampilan dan kelola kategori.</p>
      </div>

      <section className="rounded-2xl border bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm">
        <h3 className="text-lg font-heading font-semibold text-slate-900 dark:text-white mb-4">Profil</h3>
        <div className="flex items-center gap-4">
          {user?.picture ? (
            <img src={user.picture} alt={user.name} className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-semibold">
              {user?.name?.[0]}
            </div>
          )}
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{user?.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm">
        <h3 className="text-lg font-heading font-semibold text-slate-900 dark:text-white mb-4">Tema Tampilan</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Warna Aksen</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {Object.entries(ACCENTS).map(([key, val]) => (
            <button
              key={key}
              data-testid={`accent-option-${key}`}
              onClick={() => setAccent(key)}
              className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                accent === key ? "border-slate-400 dark:border-slate-500" : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <span className="w-5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: val.swatch }} />
              <span className="text-sm text-slate-700 dark:text-slate-200 truncate">{val.name}</span>
              {accent === key && <Check className="w-3.5 h-3.5 text-slate-500 ml-auto flex-shrink-0" />}
            </button>
          ))}
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Mode Tampilan</p>
        <div className="flex gap-3">
          <button
            data-testid="theme-toggle-light"
            onClick={() => setMode("light")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              mode === "light"
                ? "bg-primary text-primary-foreground border-primary"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
            }`}
          >
            <Sun className="w-4 h-4" /> Terang
          </button>
          <button
            data-testid="theme-toggle-dark"
            onClick={() => setMode("dark")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              mode === "dark"
                ? "bg-primary text-primary-foreground border-primary"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
            }`}
          >
            <Moon className="w-4 h-4" /> Gelap
          </button>
        </div>
      </section>

      <section className="rounded-2xl border bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-heading font-semibold text-slate-900 dark:text-white">Kategori</h3>
          <Dialog open={catModalOpen} onOpenChange={setCatModalOpen}>
            <DialogTrigger asChild>
              <Button data-testid="add-custom-category-button" size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Kategori
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Kategori Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Nama</Label>
                  <Input
                    data-testid="new-category-name-input"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Contoh: Donasi"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Tipe</Label>
                  <Select value={newCatType} onValueChange={setNewCatType}>
                    <SelectTrigger data-testid="new-category-type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Pengeluaran</SelectItem>
                      <SelectItem value="income">Pemasukan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Ikon</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {ICON_OPTIONS.map((name) => {
                      const Icon = getIcon(name);
                      return (
                        <button
                          key={name}
                          type="button"
                          data-testid={`icon-option-${name}`}
                          onClick={() => setNewCatIcon(name)}
                          className={`aspect-square rounded-lg border flex items-center justify-center ${
                            newCatIcon === name
                              ? "border-slate-500 bg-slate-100 dark:bg-slate-800"
                              : "border-slate-200 dark:border-slate-800"
                          }`}
                        >
                          <Icon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Warna</Label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        data-testid={`color-option-${c}`}
                        onClick={() => setNewCatColor(c)}
                        className={`w-7 h-7 rounded-full border-2 ${newCatColor === c ? "border-slate-500" : "border-transparent"}`}
                        style={{ backgroundColor: COLOR_HEX[c] }}
                      />
                    ))}
                  </div>
                </div>
                <Button data-testid="save-category-button" onClick={handleAddCategory} className="w-full">
                  Simpan Kategori
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(categories || []).map((cat) => {
            const Icon = getIcon(cat.icon);
            const hex = COLOR_HEX[cat.color];
            return (
              <div
                key={cat.id}
                data-testid={`category-item-${cat.id}`}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800"
              >
                <span className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${hex}1A`, color: hex }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  {cat.name}
                  <span
                    className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded ${
                      cat.type === "income" ? "text-emerald-600 bg-emerald-500/10" : "text-rose-600 bg-rose-500/10"
                    }`}
                  >
                    {cat.type === "income" ? "Masuk" : "Keluar"}
                  </span>
                </span>
                {!cat.is_default && (
                  <button
                    data-testid={`delete-category-${cat.id}`}
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
