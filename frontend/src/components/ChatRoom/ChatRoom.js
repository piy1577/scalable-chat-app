import { useEffect, useRef, useState } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useChatState } from "../../hooks";
import { useUsers } from "../../contexts/UserContext";
import NoCurrentUser from "./NoCurrentUser";
import ChatHeader from "./ChatHeader";
import NoMessage from "./NoMessage";
import "./ChatRoom.css";

const ChatRoom = () => {
    const { currentUser } = useUsers();
    const { messages, sendMessage, loadMessages } = useChatState(currentUser);
    const messageInputRef = useRef(null);
    const chatMessagesRef = useRef(null);
    const [top, setTop] = useState(false);

    useEffect(() => {
        const chatEl = chatMessagesRef.current;
        if (!chatMessagesRef.current) return;
        const handleScroll = () => {
            if (
                chatEl.scrollHeight + chatEl.scrollTop <=
                chatEl.clientHeight + 10
            ) {
                setTop(true);
            }
        };

        chatEl.addEventListener("scroll", handleScroll);
        return () => {
            chatEl.removeEventListener("scroll", handleScroll);
        };
    }, [currentUser]);

    useEffect(() => {
        const chatEl = chatMessagesRef.current;
        if (top && chatEl) {
            const prevScrollHeight = chatEl.scrollHeight;

            loadMessages().then(() => {
                requestAnimationFrame(() => {
                    const newScrollHeight = chatEl.scrollHeight;
                    chatEl.scrollTop += newScrollHeight - prevScrollHeight;
                });

                setTop(false);
            });
        }
    }, [top]);

    const handleSendMessage = (content) => {
        if (!currentUser) return;
        sendMessage(content);
    };
    if (!currentUser) return <NoCurrentUser />;

    return (
        <div className="chat-room">
            <ChatHeader />
            <div className="chat-messages" ref={chatMessagesRef}>
                {messages?.length > 0 ? (
                    <MessageList messages={messages} />
                ) : (
                    <NoMessage />
                )}
            </div>
            <div className="chat-input">
                <MessageInput
                    ref={messageInputRef}
                    onSendMessage={handleSendMessage}
                    placeholder={`Message ${currentUser.name}...`}
                />
            </div>
        </div>
    );
};

export default ChatRoom;
