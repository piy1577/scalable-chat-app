import { createContext, useContext, useEffect, useState } from "react";
import { useSocket } from "./SocketContext";
import { getUsers } from "../services/user.service";

const userContext = createContext();

const UserProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const { socket } = useSocket();

    useEffect(() => {
        if (currentUser) {
            const userIndex = users.findIndex(
                (u) => u.userId === currentUser.userId
            );
            if (users[userIndex]?.unreadCount !== 0)
                setUsers((t) =>
                    t.map((u, i) =>
                        i === userIndex ? { ...u, unreadCount: 0 } : u
                    )
                );
        }
    }, [currentUser, users]);

    useEffect(() => {
        getUsers(setUsers);
    }, []);

    useEffect(() => {
        if (users) {
            setCurrentUser((t) =>
                t === null ? null : users.find((u) => u.id === t.id)
            );
        }
    }, [users]);

    useEffect(() => {
        const handleTyping = (roomId) => {
            setUsers((t) =>
                t.map((u) => (u.roomId === roomId ? { ...u, typing: true } : u))
            );
        };
        const handleStoppedTyping = (roomId) => {
            setUsers((t) =>
                t.map((u) =>
                    u.roomId === roomId ? { ...u, typing: false } : u
                )
            );
        };
        const handleGetUsers = () => getUsers(setUsers);
        if (socket) {
            socket.on("get_users", handleGetUsers);
            socket.on("typing", handleTyping);
            socket.on("stopped_typing", handleStoppedTyping);
        }
        return () => {
            if (socket) {
                socket.off("get_users", handleGetUsers);
                socket.off("typing", handleTyping);
                socket.off("stopped_typing", handleStoppedTyping);
            }
        };
    }, [socket]);

    return (
        <userContext.Provider
            value={{ users, currentUser, setCurrentUser, setUsers }}
        >
            {children}
        </userContext.Provider>
    );
};

export const useUsers = () => {
    return useContext(userContext);
};

export default UserProvider;
