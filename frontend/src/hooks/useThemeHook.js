import { useState, useEffect, useCallback, useMemo } from "react";

export const useTheme = () => {
    const [theme, setTheme] = useState(() => {
        if (typeof window === "undefined") return "light";
        const saved = localStorage.getItem("theme");
        if (saved) return saved;
        return window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    });

    const toggleTheme = useCallback(() => {
        setTheme((prev) => {
            const next = prev === "light" ? "dark" : "light";
            localStorage.setItem("theme", next);
            return next;
        });
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        const body = document.body;
        root.setAttribute("data-theme", theme);
        body.classList.remove("light-theme", "dark-theme");
        body.classList.add(`${theme}-theme`);
    }, [theme]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e) => {
            const userSet = localStorage.getItem("theme");
            if (!userSet) {
                setTheme(e.matches ? "dark" : "light");
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    return useMemo(
        () => ({
            theme,
            toggleTheme,
            setTheme, 
            isDark: theme === "dark",
            isLight: theme === "light",
        }),
        [theme, toggleTheme]
    );
};
