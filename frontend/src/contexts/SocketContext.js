import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!user) return;
        if (!socket) {
            const s = io(process.env.REACT_APP_SOCKET_URL, {
                transports: ["websocket"],
            });
            s.onAny((event, ...args) => {
                console.log("🔹Incoming event:", event, "→", args);
            });
            const originalEmit = s.emit;
            s.emit = function (event, ...args) {
                console.log(`📤 emitting event: '${event}' →`, args);
                return originalEmit.call(this, event, ...args);
            };

            s.on("connect_error", (err) => console.error("Socket error:", err));
            s.emit("register", user.id);

            setSocket(s);
        }
        return () => {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        };
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketProvider;
