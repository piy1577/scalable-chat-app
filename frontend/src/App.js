import "./App.css";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Home/Layout";
import React from "react";
import ToastProvider from "./contexts/ToastContext";
const App = React.memo(() => {
    return (
        <ToastProvider>
            <AuthProvider>
                <Layout />
            </AuthProvider>
        </ToastProvider>
    );
});

export default App;
