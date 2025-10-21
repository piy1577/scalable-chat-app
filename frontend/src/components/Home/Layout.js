import { useAuth } from "../../contexts/AuthContext";
import Header from "./Header";
import Loading from "./Loading";
import Login from "../Login/Login";
import Sidebar from "../Sidebar/Sidebar";
import ChatRoom from "../ChatRoom/ChatRoom";

function Layout() {
    const { user, loading } = useAuth();

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
                <Sidebar />
                <ChatRoom />
            </div>
        </div>
    );
}
export default Layout;
