import {
  Utensils, Car, ShoppingBag, Zap, HeartPulse, Film, GraduationCap, Wallet,
  TrendingUp, Gift, MoreHorizontal, Home, Coffee, Smartphone, BookOpen,
  Circle, PawPrint, Plane, Gamepad2,
} from "lucide-react";

export const ICON_MAP = {
  Utensils, Car, ShoppingBag, Zap, HeartPulse, Film, GraduationCap, Wallet,
  TrendingUp, Gift, MoreHorizontal, Home, Coffee, Smartphone, BookOpen,
  Circle, PawPrint, Plane, Gamepad2,
};

export const getIcon = (name) => ICON_MAP[name] || Circle;

export const ICON_OPTIONS = Object.keys(ICON_MAP).filter((k) => k !== "Circle" && k !== "MoreHorizontal");

export const COLOR_HEX = {
  rose: "#f43f5e",
  amber: "#f59e0b",
  purple: "#a855f7",
  blue: "#3b82f6",
  pink: "#ec4899",
  indigo: "#6366f1",
  cyan: "#06b6d4",
  slate: "#64748b",
  emerald: "#10b981",
  teal: "#14b8a6",
  green: "#22c55e",
};

export const COLOR_OPTIONS = Object.keys(COLOR_HEX);
