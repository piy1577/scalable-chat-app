import "./App.css";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Home/Layout";
import SocketProvider from "./contexts/SocketContext";
import UserProvider from "./contexts/UserContext";
import React from "react";
import ToastProvider from "./contexts/ToastContext";
const App = React.memo(() => {
    return (
        <ToastProvider>
            <ThemeProvider>
                <AuthProvider>
                    <SocketProvider>
                        <UserProvider>
                            <Layout />
                        </UserProvider>
                    </SocketProvider>
                </AuthProvider>
            </ThemeProvider>
        </ToastProvider>
    );
});

export default App;
