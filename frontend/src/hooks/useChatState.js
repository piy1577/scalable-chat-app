import { useState, useEffect } from "react";
import { getMessages } from "../services/chat.service";
import { useSocket } from "../contexts/SocketContext";
import { useAuth } from "../contexts/AuthContext";
import { message_seen, new_message } from "../utils/chat.utils";
import { useUsers } from "../contexts/UserContext";

export const useChatState = () => {
    const [messages, setMessages] = useState([]);
    const { user } = useAuth();
    const { socket } = useSocket();
    const { currentUser, setUsers } = useUsers();

    useEffect(() => {
        if (currentUser) {
            getMessages(currentUser.roomId, setMessages);
        }
    }, [currentUser]);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (content) =>
            new_message(content, currentUser, setMessages, socket, setUsers);

        const handleMessageSeen = (data) => {
            message_seen(data, currentUser, setMessages, user);
        };
        if (currentUser)
            socket.emit("seen_message", { roomId: currentUser.roomId });

        socket.on("new_message", handleNewMessage);
        socket.on("message_seen", handleMessageSeen);
        return () => {
            socket.off("new_message", handleNewMessage);
            socket.off("message_seen", handleMessageSeen);
        };
    }, [socket, currentUser, setMessages, user, setUsers]);

    const sendMessage = (content) => {
        if (!content.trim() || !currentUser) return;
        const message = {
            content: content.trim(),
            roomId: currentUser.roomId,
        };
        if (socket) {
            socket.emit("send_message", message);
            setUsers((t) =>
                t.map((u) =>
                    u.roomId === currentUser.roomId
                        ? {
                              ...u,
                              lastMessage: {
                                  senderId: user.id,
                                  content: content.trim(),
                                  roomId: currentUser.roomId,
                                  createdAt: new Date().toISOString(),
                                  seen: false,
                              },
                          }
                        : u
                )
            );
            setMessages((t) => [
                ...t,
                {
                    senderId: user.id,
                    content: content.trim(),
                    roomId: currentUser.roomId,
                    createdAt: new Date().toISOString(),
                    seen: false,
                },
            ]);
        }
    };

    return { messages, sendMessage };
};
