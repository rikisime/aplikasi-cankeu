import { useState } from "react";
import useSWR from "swr";
import { FileSpreadsheet, FileText } from "lucide-react";
import { api, API } from "../lib/api";
import PeriodSelector from "../components/PeriodSelector";
import SummaryCards from "../components/SummaryCards";
import CashflowChart from "../components/charts/CashflowChart";
import CategoryPieChart from "../components/charts/CategoryPieChart";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

const fetcher = (url) => api.get(url).then((res) => res.data);

async function downloadFile(url, filenameFallback) {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("gagal mengunduh");
  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename=([^;]+)/);
  const filename = match ? match[1].trim() : filenameFallback;
  const objectUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(objectUrl);
}

export default function Reports() {
  const [period, setPeriod] = useState("monthly");
  const [exporting, setExporting] = useState(null);
  const { data: summary } = useSWR(`/reports/summary?period=${period}`, fetcher);

  const handleExport = async (format) => {
    setExporting(format);
    try {
      await downloadFile(`${API}/export/${format}?period=${period}`, `laporan.${format === "pdf" ? "pdf" : "xlsx"}`);
      toast.success(`Laporan ${format.toUpperCase()} berhasil diekspor`);
    } catch (e) {
      toast.error("Gagal mengekspor laporan");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-white">Laporan</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Analisis keuangan dalam bentuk grafis.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <PeriodSelector value={period} onChange={setPeriod} />
          <div className="flex items-center gap-2">
            <Button
              data-testid="export-pdf-button"
              variant="outline"
              onClick={() => handleExport("pdf")}
              disabled={exporting === "pdf"}
              className="gap-2"
            >
              <FileText className="w-4 h-4" /> PDF
            </Button>
            <Button
              data-testid="export-excel-button"
              variant="outline"
              onClick={() => handleExport("excel")}
              disabled={exporting === "excel"}
              className="gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" /> Excel
            </Button>
          </div>
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
    </div>
  );
}
