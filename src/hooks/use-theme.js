import { useCallback, useEffect, useState } from "react";
const KEY = "aisd.theme";
function useTheme() {
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    const stored = window.localStorage.getItem(KEY);
    const initial = stored ?? "light";
    setTheme(initial);
    document.documentElement.classList.toggle("light", initial === "dark");
  }, []);
  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "light" : "light";
      window.localStorage.setItem(KEY, next);
      document.documentElement.classList.toggle("light", next === "dark");
      return next;
    });
  }, []);
  return { theme, toggle };
}
export {
  useTheme
};
