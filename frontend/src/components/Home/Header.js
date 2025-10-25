import ThemeToggle from "../ThemeToggle/ThemeToggle";

const Header = () => {
    return (
        <div className="app-header">
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <h1>Chat App</h1>
            </div>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                }}
            >
                <ThemeToggle />
            </div>
        </div>
    );
};

export default Header;
