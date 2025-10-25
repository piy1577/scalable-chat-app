import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
} from "react";

const ThemeContext = createContext(null);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
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

        body.classList.toggle("dark-theme", theme === "dark");
        body.classList.toggle("light-theme", theme === "light");
    }, [theme]);

    const value = useMemo(
        () => ({
            theme,
            toggleTheme,
            isDark: theme === "dark",
            isLight: theme === "light",
        }),
        [theme]
    );
    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
};
