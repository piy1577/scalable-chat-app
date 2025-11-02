import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const { error } = useToast();

    useEffect(() => {
        if (!user) return;
        if (!socket) {
            const s = io(process.env.REACT_APP_SERVER_URL, {
                transports: ["websocket"],
            });

            s.on("connect_error", (err) => {
                error("Connection Error", err.message);
            });
            s.emit("register", user.id);

            setSocket(s);
        }
        return () => {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        };
    }, [user, error, socket]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketProvider;
