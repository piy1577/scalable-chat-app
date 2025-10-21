import { Avatar } from "primereact/avatar";
import { useUsers } from "../../contexts/UserContext";
import { formatLastSeen, getStatusColor } from "../../utils/statusUtils";

const ChatHeader = () => {
    const { currentUser } = useUsers();
    return (
        <div className="contact-profile-header">
            <div className="contact-profile">
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
