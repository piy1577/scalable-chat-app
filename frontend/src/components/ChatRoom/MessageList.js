import { Avatar } from "primereact/avatar";
import "./MessageList.css";
import {
    formatTime,
    groupMessagesBySender,
    groupMessagesByDate,
    formatDateSeparator,
} from "../../utils/chat.utils";
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

    const isSystemMessage = (message) => {
        return message.senderId === "system";
    };
    const dateGroups = groupMessagesByDate(messages);

    return (
        <div className="message-list">
            {dateGroups.map((dateGroup) => (
                <div key={dateGroup.date}>
                    <div className="date-separator">
                        <span className="date-separator-text">
                            {formatDateSeparator(
                                dateGroup.messages[0].createdAt
                            )}
                        </span>
                    </div>

                    {(() => {
                        const messageGroups = groupMessagesBySender(
                            dateGroup.messages,
                            user.id
                        );
                        return messageGroups.map((group) => {
                            // Handle system messages separately
                            const systemMessages =
                                group.messages.filter(isSystemMessage);
                            const regularMessages = group.messages.filter(
                                (msg) => !isSystemMessage(msg)
                            );

                            return (
                                <div key={group.messages[0].id}>
                                    {/* Render system messages */}
                                    {systemMessages.map((message) => (
                                        <div
                                            key={message.id}
                                            className="message system-message"
                                        >
                                            <div className="message-content">
                                                <div className="message-bubble system-bubble">
                                                    <p>{message.content}</p>
                                                    <div className="message-time system-time">
                                                        {formatTime(
                                                            message.createdAt
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Render regular messages */}
                                    {regularMessages.length > 0 && (
                                        <div
                                            className={`message-group ${
                                                group.isOwn ? "own" : "other"
                                            }`}
                                        >
                                            {regularMessages.map(
                                                (message, messageIndex) => {
                                                    const user = getUserById(
                                                        message.senderId
                                                    );
                                                    const isLastInGroup =
                                                        messageIndex ===
                                                        regularMessages.length -
                                                            1;

                                                    return (
                                                        <div
                                                            key={message.id}
                                                            className={`message ${
                                                                group.isOwn
                                                                    ? "own"
                                                                    : "other"
                                                            }`}
                                                        >
                                                            <div className="message-content">
                                                                <div className="message-bubble">
                                                                    <p>
                                                                        {
                                                                            message.content
                                                                        }
                                                                    </p>
                                                                    <div className="message-time">
                                                                        {formatTime(
                                                                            message.createdAt
                                                                        )}
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
                                                                                image={
                                                                                    user.picture
                                                                                }
                                                                                size="normal"
                                                                                shape="circle"
                                                                                style={{
                                                                                    width: "16px",
                                                                                    height: "16px",
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        });
                    })()}
                </div>
            ))}
        </div>
    );
};

export default MessageList;
