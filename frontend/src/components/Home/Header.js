import ThemeToggle from "../ThemeToggle/ThemeToggle";

const Header = () => {
    return (
        <div className="app-header">
            <h1>Chat App</h1>
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
