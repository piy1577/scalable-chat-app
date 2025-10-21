import { Avatar } from "primereact/avatar";
import { getStatusColor, getStatusText } from "../../utils/statusUtils";

const UserDetails = ({ user }) => {
    return (
        <div className="profile-info">
            <div className="profile-avatar">
                <Avatar image={user.picture} size="large" shape="circle" />
                <div
                    className="status-indicator"
                    style={{
                        backgroundColor: getStatusColor(user.isActive),
                    }}
                />
            </div>
            <div className="profile-details">
                <div className="profile-name">{user.name}</div>
                <div className="profile-email">{user.email}</div>
                <div className="profile-status">
                    <small>{getStatusText(user)}</small>
                </div>
            </div>
        </div>
    );
};

export default UserDetails;
