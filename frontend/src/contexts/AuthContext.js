import { createContext, useContext, useState, useEffect } from "react";
import { checkAuthStatus, logout } from "../services/auth.service";

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        checkAuthStatus(setUser, setLoading);
    }, []);

    const value = {
        user,
        loading,
        logout: () => logout(setUser),
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
