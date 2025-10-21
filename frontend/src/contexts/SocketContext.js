import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const socketContext = createContext();

const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            const connected = io(process.env.REACT_APP_SOCKET_URL);

            if (connected) {
                setSocket(connected);
                connected.on("error", (error) => console.error(error));
            }
        }
    }, [user]);

    useEffect(() => {
        if (!user && socket) {
            socket.disconnect();
        }
    }, [user, socket]);

    useEffect(() => {
        if (user && socket) {
            socket.emit("register", user.id);
        }
    }, [user, socket]);

    return (
        <socketContext.Provider value={{ socket }}>
            {children}
        </socketContext.Provider>
    );
};

export const useSocket = () => {
    return useContext(socketContext);
};

export default SocketProvider;
