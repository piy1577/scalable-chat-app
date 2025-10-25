import { useAuth } from "../../contexts/AuthContext";
import Header from "./Header";
import Loading from "./Loading";
import Login from "../Login/Login";
import Sidebar from "../Sidebar/Sidebar";
import ChatRoom from "../ChatRoom/ChatRoom";
import { useUsers } from "../../contexts/UserContext";
import { useEffect, useState } from "react";

function Layout() {
    const { user, loading } = useAuth();
    const { currentUser } = useUsers();
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        window.addEventListener("resize", () =>
            setIsMobile(window.innerWidth <= 768)
        );
    }, []);

    if (loading) {
        return <Loading />;
    }

    if (!user) {
        return <Login />;
    }

    return (
        <div className="app">
            <Header />
            <div className="app-body">
                {isMobile ? (
                    currentUser ? (
                        <ChatRoom isMobile={true} />
                    ) : (
                        <Sidebar isMobile={true} />
                    )
                ) : (
                    <>
                        <Sidebar />
                        <ChatRoom />
                    </>
                )}
            </div>
        </div>
    );
}
export default Layout;
