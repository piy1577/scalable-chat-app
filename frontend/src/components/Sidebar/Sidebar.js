import "./Sidebar.css";
import UserProfile from "./UserProfile";
import UserList from "./UserList";

const Sidebar = () => {
    return (
        <div className="sidebar">
            <UserProfile />
            <UserList />
        </div>
    );
};

export default Sidebar;
