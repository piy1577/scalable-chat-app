import { Button } from "primereact/button";
import { useAuth } from "../../contexts/AuthContext";

const ProfilePopup = ({
    setOptionOpen,
    isOptionsOpen,
    setInviteOpen,
    menuRef,
}) => {
    const { logout } = useAuth();
    return (
        <div className="menu-container" ref={menuRef}>
            <Button
                icon="pi pi-ellipsis-v"
                className="p-button-rounded p-button-text p-button-sm menu-button"
                onClick={() => setOptionOpen((t) => !t)}
                tooltip="Options"
                tooltipOptions={{ position: "bottom" }}
            />
            {isOptionsOpen && (
                <div className="menu-dropdown">
                    <div
                        className="menu-item"
                        onClick={() => {
                            setInviteOpen(true);
                            setOptionOpen(false);
                        }}
                    >
                        <i className="pi pi-plus"></i>
                        <span>Invite User</span>
                    </div>
                    <div
                        className="menu-item"
                        onClick={() => {
                            logout();
                            setOptionOpen(false);
                        }}
                    >
                        <i className="pi pi-sign-out"></i>
                        <span>Logout</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePopup;
