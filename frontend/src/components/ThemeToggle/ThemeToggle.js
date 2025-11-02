import { useTheme } from "../../hooks/useThemeHook";

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${
                theme === "light" ? "dark" : "light"
            } theme`}
            title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
        >
            <span className="theme-toggle-icon">
                {theme === "light" ? "🌙" : "☀️"}
            </span>
            <span className="theme-toggle-text">
                {theme === "light" ? "Dark" : "Light"}
            </span>
        </button>
    );
};

export default ThemeToggle;
