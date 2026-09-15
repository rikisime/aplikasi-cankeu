import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Wallet, PieChart, ShieldCheck } from "lucide-react";

export default function Login() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen w-full bg-[#0B0F17] relative overflow-hidden flex items-center justify-center px-4">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-emerald-500 to-rose-500 flex items-center justify-center font-bold text-white font-heading">
              A
            </div>
            <span className="text-xl font-heading font-bold text-white">ArthaKu</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white leading-tight mb-3">
            Kelola Keuangan
            <br />
            Harianmu dengan Tenang
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mb-8 leading-relaxed">
            Catat uang masuk & keluar, lihat laporan grafis harian sampai tahunan, dan ekspor kapan saja. Setiap
            akun punya data & tampilan sendiri.
          </p>

          <button
            data-testid="google-login-button"
            onClick={login}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-xl py-3.5 transition-all active:scale-[0.98] shadow-lg"
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4c-7.7 0-14.3 4.4-17.7 10.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.5 0 10.4-1.8 14.1-5l-6.5-5.3C29.6 35.4 27 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.6 5.1C9.6 39.6 16.2 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.7l6.5 5.3C41.5 36 44 30.5 44 24c0-1.3-.1-2.7-.4-3.5z"
              />
            </svg>
            Masuk dengan Google
          </button>

          <div className="grid grid-cols-3 gap-3 mt-8">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-[11px] text-slate-500">Catat Transaksi</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <PieChart className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-[11px] text-slate-500">Laporan Grafis</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-rose-400" />
              </div>
              <span className="text-[11px] text-slate-500">Data Privat</span>
            </div>
          </div>
        </div>
        <p className="text-center text-slate-600 text-xs mt-6">© 2026 ArthaKu — Pencatat Keuangan Harian</p>
      </motion.div>
    </div>
  );
}
