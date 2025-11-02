import Header from "./Header";
import Sidebar from "../Sidebar/Sidebar";
import ChatRoom from "../ChatRoom/ChatRoom";
import { useUsers } from "../../contexts/UserContext";
import { useEffect, useState } from "react";

function Layout() {
    const { currentUser } = useUsers();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <div className="app">
            <Header />
            <div className="app-body">
                {isMobile ? (
                    currentUser ? (
                        <ChatRoom />
                    ) : (
                        <Sidebar />
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
