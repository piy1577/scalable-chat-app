import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    useMemo,
} from "react";
import { useSocket } from "./SocketContext";
import { getUsers } from "../services/user.service";

const UserContext = createContext(null);

export const useUsers = () => useContext(UserContext);

const UserProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const { socket } = useSocket();
    const usersRef = useRef(users);

    useEffect(() => {
        usersRef.current = users;
    }, [users]);

    useEffect(() => {
        getUsers(setUsers);
    }, []);

    useEffect(() => {
        if (!currentUser) return;
        setUsers((prev) => {
            const idx = prev.findIndex((u) => u.userId === currentUser.userId);
            if (idx === -1 || prev[idx].unreadCount === 0) return prev;
            const updated = [...prev];
            updated[idx] = { ...updated[idx], unreadCount: 0 };
            return updated;
        });
    }, [currentUser]);

    useEffect(() => {
        setCurrentUser((prev) => {
            if (!prev) return null;
            const match = users.find((u) => u.id === prev.id);
            return match || prev;
        });
    }, [users]);

    useEffect(() => {
        if (!socket) return;

        const handleTyping = (roomId) => {
            setUsers((prev) =>
                prev.map((u) =>
                    u.roomId === roomId ? { ...u, typing: true } : u
                )
            );
        };

        const handleStoppedTyping = (roomId) => {
            setUsers((prev) =>
                prev.map((u) =>
                    u.roomId === roomId ? { ...u, typing: false } : u
                )
            );
        };

        const handleGetUsers = () => getUsers(setUsers);
        const handleAddUesr = (data) => {
            socket.emit("add_room", data);
        };

        socket.on("get_users", handleGetUsers);
        socket.on("typing", handleTyping);
        socket.on("stopped_typing", handleStoppedTyping);
        socket.on("add_room", handleAddUesr);

        return () => {
            socket.off("get_users", handleGetUsers);
            socket.off("typing", handleTyping);
            socket.off("stopped_typing", handleStoppedTyping);
            socket.off("add_room", handleAddUesr);
        };
    }, [socket]);

    const value = useMemo(
        () => ({
            users,
            currentUser,
            setCurrentUser,
            setUsers,
        }),
        [users, currentUser]
    );

    return (
        <UserContext.Provider value={value}>{children}</UserContext.Provider>
    );
};

export default UserProvider;
