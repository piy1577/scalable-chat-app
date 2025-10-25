import { Avatar } from "primereact/avatar";
import { useUsers } from "../../contexts/UserContext";
import { formatLastSeen, getStatusColor } from "../../utils/statusUtils";
import { useState, useEffect } from "react";

const ChatHeader = () => {
    const { currentUser, setCurrentUser } = useUsers();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);

        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const handleBackClick = () => {
        setCurrentUser(null);
    };

    return (
        <div className="contact-profile-header">
            <div className="contact-profile">
                {isMobile && currentUser && (
                    <button
                        className="back-button"
                        onClick={handleBackClick}
                        style={{
                            background: "none",
                            border: "none",
                            fontSize: "1.5rem",
                            cursor: "pointer",
                            padding: "0.5rem",
                            marginRight: "0.1rem",
                            color: "var(--text-primary)",
                        }}
                    >
                        ←
                    </button>
                )}
                <div className="contact-avatar-large">
                    <Avatar
                        image={currentUser.picture}
                        size="large"
                        shape="circle"
                    />
                    <div
                        className="status-indicator-large"
                        style={{
                            backgroundColor: getStatusColor(
                                currentUser.isActive
                            ),
                        }}
                    />
                </div>
                <div className="contact-details">
                    <h3>{currentUser.name}</h3>
                    <p className="contact-status-text">
                        {currentUser.typing && "Typing..."}
                        {currentUser.isActive &&
                            !currentUser.typing &&
                            "Active now"}
                        {currentUser.isActive === false &&
                            !currentUser.typing &&
                            `Last seen ${formatLastSeen(
                                currentUser.updatedAt
                            )}`}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatHeader;
