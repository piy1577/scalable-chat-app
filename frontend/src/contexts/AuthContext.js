import { createContext, useContext, useState, useEffect, useMemo } from "react";
import {
    checkAuthStatus,
    logout,
    handleAuthCallback,
} from "../services/auth.service";
import { useToast } from "./ToastContext";
import Loading from "../components/Home/Loading";
import Login from "../components/Login/Login";
import SocketProvider from "./SocketContext";
import UserProvider from "./UserContext";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { success } = useToast();

    useEffect(() => {
        handleAuthCallback();
        checkAuthStatus(setUser, setLoading);
    }, []);

    const handleLogout = async () => {
        await logout(setUser, success);
    };

    const value = useMemo(
        () => ({
            user,
            loading,
            logout: handleLogout,
        }),
        [user, loading]
    );

    if (loading) {
        return <Loading />;
    }

    if (!user) {
        return <Login />;
    }

    return (
        <AuthContext.Provider value={value}>
            <SocketProvider>
                <UserProvider>{children}</UserProvider>
            </SocketProvider>
        </AuthContext.Provider>
    );
};
