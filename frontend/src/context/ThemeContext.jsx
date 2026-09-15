import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";
import { useAuth } from "./AuthContext";

export const ACCENTS = {
  ocean_blue: { name: "Samudra Blue", primary: "217 91% 53%", ring: "217 91% 53%", swatch: "#2563EB" },
  emerald_green: { name: "Zamrud Green", primary: "160 84% 33%", ring: "160 84% 33%", swatch: "#059669" },
  crimson_red: { name: "Delima Red", primary: "0 72% 51%", ring: "0 72% 51%", swatch: "#DC2626" },
  midnight_slate: { name: "Malam Dark", primary: "199 89% 48%", ring: "199 89% 48%", swatch: "#38BDF8" },
};

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const { user, setUser } = useAuth();
  const [accent, setAccentState] = useState("ocean_blue");
  const [mode, setModeState] = useState("light");

  useEffect(() => {
    if (user) {
      setAccentState(user.accent_color || "ocean_blue");
      setModeState(user.theme_mode || "light");
    }
  }, [user]);

  useEffect(() => {
    const root = document.documentElement;
    const a = ACCENTS[accent] || ACCENTS.ocean_blue;
    root.style.setProperty("--primary", a.primary);
    root.style.setProperty("--ring", a.ring);
    if (mode === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [accent, mode]);

  const setAccent = useCallback(
    async (key) => {
      setAccentState(key);
      try {
        const res = await api.put("/auth/theme", { accent_color: key });
        setUser(res.data);
      } catch (e) {
        // ignore
      }
    },
    [setUser]
  );

  const setMode = useCallback(
    async (m) => {
      setModeState(m);
      try {
        const res = await api.put("/auth/theme", { theme_mode: m });
        setUser(res.data);
      } catch (e) {
        // ignore
      }
    },
    [setUser]
  );

  return (
    <ThemeContext.Provider value={{ accent, mode, setAccent, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
