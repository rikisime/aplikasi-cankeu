export const formatRupiah = (value) => {
  const rounded = Math.round(Number(value) || 0);
  return `Rp ${rounded.toLocaleString("id-ID")}`;
};

export const formatDateID = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
};

export const todayISO = () => new Date().toISOString().slice(0, 10);
