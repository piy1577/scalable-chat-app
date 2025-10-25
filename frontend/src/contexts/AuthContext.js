import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { checkAuthStatus, logout } from "../services/auth.service";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuthStatus(setUser, setLoading);
    }, []);

    const value = useMemo(
        () => ({
            user,
            loading,
            logout: () => logout(setUser),
        }),
        [user, loading]
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
