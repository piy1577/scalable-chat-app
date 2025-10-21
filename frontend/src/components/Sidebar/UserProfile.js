import InviteModal from "./InviteModal";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useUsers } from "../../contexts/UserContext";
import {
    keydownHandler,
    mouseDownHandler,
} from "../../utils/userProfile.utils";
import UserDetails from "./UserDetails";
import ProfilePopup from "./ProfilePopup";

const UserProfile = () => {
    const { user } = useAuth();
    const menuRef = useRef(null);
    const { currentUser, setCurrentUser } = useUsers();
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);

    useEffect(
        () =>
            keydownHandler(
                isOptionsMenuOpen,
                setIsOptionsMenuOpen,
                isInviteModalOpen,
                setIsInviteModalOpen,
                currentUser,
                setCurrentUser
            ),
        [isOptionsMenuOpen, isInviteModalOpen, currentUser, setCurrentUser]
    );

    useEffect(
        () =>
            mouseDownHandler(isOptionsMenuOpen, setIsOptionsMenuOpen, menuRef),
        [isOptionsMenuOpen, setIsOptionsMenuOpen]
    );

    return (
        <div className="user-profile">
            <UserDetails user={user} />
            <ProfilePopup
                setOptionOpen={setIsOptionsMenuOpen}
                setInviteOpen={setIsInviteModalOpen}
                isOptionsOpen={isOptionsMenuOpen}
                menuRef={menuRef}
            />
            <InviteModal
                visible={isInviteModalOpen}
                onHide={() => setIsInviteModalOpen(false)}
            />
        </div>
    );
};

export default UserProfile;
