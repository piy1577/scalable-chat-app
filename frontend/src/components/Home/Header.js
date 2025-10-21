import ThemeToggle from "../ThemeToggle/ThemeToggle";

const Header = () => {
    const isConnected = true;
    return (
        <div className="app-header">
            <h1>
                Chat App <span className="demo-badge">DEMO</span>
            </h1>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                }}
            >
                <ThemeToggle />
                <div
                    className={`connection-status ${
                        isConnected ? "connected" : "disconnected"
                    }`}
                >
                    {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
                </div>
            </div>
        </div>
    );
};

export default Header;
