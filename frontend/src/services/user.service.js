import apiUtil from "../utils/api.utils";

export const getUsers = async (setUser) => {
    try {
        const users = await apiUtil.get("user");
        const response = await users.json();
        setUser(response);
    } catch (err) {
        console.error(err);
    }
};

export const inviteUser = async (email, socket) => {
    try {
        const res = await apiUtil.post("user", { email });
        if (res.ok) {
            const response = await res.json();
            if (response?.participants) {
                socket.emit("update_users", {
                    participants: response.participants,
                    roomId: response.roomId,
                });
            }
        }
    } catch (error) {
        console.error("Error sending invitation:", error);
    }
};
