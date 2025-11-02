import { useUsers } from "../../contexts/UserContext";
import NoUser from "./NoUser";
import UserItem from "./UserItem";

const UserList = () => {
    const { users, currentUser, setCurrentUser } = useUsers() || {
        users: [],
    };

    const handleUserSelect = (user) => {
        setCurrentUser(user);
    };

    return (
        <div className="sidebar-content">
            {users?.length > 0 ? (
                <div className="contacts-list">
                    {users.map((u) => (
                        <UserItem
                            key={u.roomId}
                            user={u}
                            selectChat={handleUserSelect}
                            currentUser={currentUser}
                        />
                    ))}
                </div>
            ) : (
                <NoUser />
            )}
        </div>
    );
};

export default UserList;
