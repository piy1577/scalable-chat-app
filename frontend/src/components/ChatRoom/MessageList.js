import { Avatar } from "primereact/avatar";
import "./MessageList.css";
import { formatTime, groupMessagesBySender } from "../../utils/chat.utils";
import { useAuth } from "../../contexts/AuthContext";
import { useUsers } from "../../contexts/UserContext";

const MessageList = ({ messages }) => {
    const { user } = useAuth();
    const { users } = useUsers() || { user: [] };
    const getUserById = (userId) => {
        if (userId === user.id) {
            return user;
        }
        return (
            users.find((user) => user.userId === userId) || {
                id: userId,
                name: "Unknown User",
                avatar: "https://i.pravatar.cc/150?u=unknown",
            }
        );
    };
    const messageGroups = groupMessagesBySender(messages, user.id);

    return (
        <div className="message-list">
            {messageGroups.map((group) => (
                <div
                    key={group.messages[0].id}
                    className={`message-group ${group.isOwn ? "own" : "other"}`}
                >
                    {group.messages.map((message, messageIndex) => {
                        const user = getUserById(message.senderId);
                        const isLastInGroup =
                            messageIndex === group.messages.length - 1;

                        return (
                            <div
                                key={message.id}
                                className={`message ${
                                    group.isOwn ? "own" : "other"
                                }`}
                            >
                                <div className="message-content">
                                    <div className="message-bubble">
                                        <p>{message.content}</p>
                                        <div className="message-time">
                                            {formatTime(message.createdAt)}
                                            {group.isOwn && (
                                                <span
                                                    className={`seen-status ${
                                                        message.seen
                                                            ? "seen"
                                                            : "sent"
                                                    }`}
                                                >
                                                    {message.seen ? (
                                                        <span className="double-tick">
                                                            ✓✓
                                                        </span>
                                                    ) : (
                                                        <span className="single-tick">
                                                            ✓
                                                        </span>
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {isLastInGroup && (
                                        <div className="message-header">
                                            <div className="message-avatar-small">
                                                <Avatar
                                                    image={user.picture}
                                                    size="normal"
                                                    shape="circle"
                                                    style={{
                                                        width: "24px",
                                                        height: "24px",
                                                    }}
                                                />
                                            </div>
                                            <span className="message-author">
                                                {group.isOwn
                                                    ? "You"
                                                    : user.name}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

export default MessageList;
