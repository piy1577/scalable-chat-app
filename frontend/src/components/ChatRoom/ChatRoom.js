import { useEffect, useRef } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useChatState } from "../../hooks";
import "./ChatRoom.css";
import { useUsers } from "../../contexts/UserContext";
import NoCurrentUser from "./NoCurrentUser";
import ChatHeader from "./ChatHeader";
import NoMessage from "./NoMessage";

const ChatRoom = () => {
    const { currentUser } = useUsers();
    const { messages, sendMessage } = useChatState(currentUser);
    const isConnected = true;
    const messagesEndRef = useRef(null);
    const messageInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (currentUser && messageInputRef.current) {
            setTimeout(() => {
                messageInputRef.current.focus();
            }, 100);
        }
    }, [currentUser]);

    const handleSendMessage = (content) => {
        if (!isConnected || !currentUser) {
            return;
        }
        sendMessage(content);
    };

    if (!currentUser) {
        return <NoCurrentUser />;
    }

    return (
        <div className="chat-room">
            <ChatHeader />
            <div className="chat-messages">
                {messages.length > 0 ? (
                    <MessageList messages={messages} />
                ) : (
                    <NoMessage />
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input">
                <MessageInput
                    ref={messageInputRef}
                    onSendMessage={handleSendMessage}
                    disabled={!isConnected}
                    placeholder={
                        !isConnected
                            ? "Connecting..."
                            : `Message ${currentUser.name}...`
                    }
                />
            </div>
        </div>
    );
};

export default ChatRoom;
