import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { checkAuthStatus, logout } from "../services/auth.service";
import { useToast } from "./ToastContext";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { success, error } = useToast();

    useEffect(() => {
        checkAuthStatus(setUser, setLoading);
    }, []);

    const handleLogout = async () => {
        await logout(setUser);
        error("Logout", "User Logout successfully");
    };

    const value = useMemo(
        () => ({
            user,
            loading,
            logout: handleLogout,
        }),
        [user, loading]
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
