export const mouseDownHandler = (
    isOptionsMenuOpen,
    setIsOptionsMenuOpen,
    menuRef
) => {
    const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setIsOptionsMenuOpen(false);
        }
    };

    if (isOptionsMenuOpen) {
        document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
};

export const keydownHandler = (
    isOptionsMenuOpen,
    setIsOptionsMenuOpen,
    isInviteModalOpen,
    setIsInviteModalOpen,
    currentUser,
    setCurrentUser
) => {
    const handleKeyDown = (event) => {
        if (event.key === "Escape") {
            if (isOptionsMenuOpen) {
                setIsOptionsMenuOpen(false);
            } else if (isInviteModalOpen) {
                setIsInviteModalOpen(false);
            } else if (currentUser) {
                setCurrentUser(null);
            }
        }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
        document.removeEventListener("keydown", handleKeyDown);
    };
};

export const truncateMessage = (message, maxLength = 30) => {
    if (!message) return "";
    return message.length > maxLength
        ? message.substring(0, maxLength) + "..."
        : message;
};
