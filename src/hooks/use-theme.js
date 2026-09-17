import { useCallback, useEffect, useState } from "react";
const KEY = "aisd.theme";
function useTheme() {
  const [theme, setTheme] = useState("dark");
  useEffect(() => {
    const stored = window.localStorage.getItem(KEY);
    const initial = stored ?? "dark";
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);
  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      window.localStorage.setItem(KEY, next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  }, []);
  return { theme, toggle };
}
export {
  useTheme
};
