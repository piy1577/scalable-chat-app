import { Avatar } from "primereact/avatar";
import { Badge } from "primereact/badge";
import { getStatusColor } from "../../utils/statusUtils";
import { truncateMessage } from "../../utils/userProfile.utils";

const UserItem = ({ user, selectChat, currentUser }) => {
    return (
        <div
            className={`contact-item ${
                currentUser?.userId === user.userId ? "active" : ""
            }`}
            onClick={() => selectChat(user)}
        >
            <div className="contact-avatar">
                <Avatar image={user.picture} size="normal" shape="circle" />
                <div
                    className="status-indicator"
                    style={{
                        backgroundColor: getStatusColor(user.isActive),
                    }}
                />
                {user.unreadCount > 0 && (
                    <Badge
                        value={user.unreadCount > 99 ? "99+" : user.unreadCount}
                        severity="danger"
                        className="unread-badge"
                        style={{
                            borderRadius: "50%",
                            minWidth: "16px",
                            height: "16px",
                            fontSize: "10px",
                            fontWeight: "bold",
                            padding: "0",
                            position: "absolute",
                            top: "-3px",
                            right: "-3px",
                            zIndex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    />
                )}
            </div>
            <div className="contact-info">
                <div className="contact-name">{user.name}</div>
                <div className="last-message">
                    <small
                        className={user.lastMessage.seen ? "seen" : "unseen"}
                    >
                        {user.typing
                            ? "Typing..."
                            : user.lastMessage?.content
                            ? user.lastMessage.senderId !== user.userId
                                ? "You: " +
                                  truncateMessage(user.lastMessage.content)
                                : "" + truncateMessage(user.lastMessage.content)
                            : "No Message Yet"}
                    </small>
                </div>
            </div>
        </div>
    );
};
export default UserItem;
