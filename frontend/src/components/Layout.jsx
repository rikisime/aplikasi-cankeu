import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, ArrowLeftRight, BarChart3, Settings as SettingsIcon, LogOut, Menu } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, testid: "nav-dashboard-link" },
  { to: "/transactions", label: "Transaksi", icon: ArrowLeftRight, testid: "nav-transactions-link" },
  { to: "/reports", label: "Laporan", icon: BarChart3, testid: "nav-reports-link" },
  { to: "/settings", label: "Pengaturan", icon: SettingsIcon, testid: "nav-settings-link" },
];

function SidebarContent({ onNavigate }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-emerald-500 to-rose-500 flex items-center justify-center font-bold text-white font-heading">
          A
        </div>
        <span className="text-lg font-heading font-bold text-slate-900 dark:text-white">ArthaKu</span>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, testid }) => (
          <NavLink
            key={to}
            to={to}
            data-testid={testid}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] flex">
      <aside className="hidden lg:flex lg:w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F17] flex-shrink-0">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-[#111827]/80 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button
                  data-testid="mobile-nav-trigger"
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Menu className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <span className="font-heading font-bold text-slate-900 dark:text-white">ArthaKu</span>
          </div>

          <div className="hidden lg:block" />

          <div className="relative">
            <button
              data-testid="user-profile-button"
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
              )}
              <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-200">
                {user?.name}
              </span>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
                <button
                  data-testid="logout-button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                >
                  <LogOut className="w-4 h-4" /> Keluar
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">{children}</main>
      </div>
    </div>
  );
}
