import apiUtil from "../utils/api.utils";

export const getUsers = async (setUser) => {
    const users = await apiUtil.get("user");
    const response = await users.json();
    setUser(response);
};

export const inviteUser = async (email, socket) => {
    const res = await apiUtil.post("user", { email });
    if (res.ok) {
        const response = await res.json();
        if (response?.participants) {
            socket.emit("update_users", {
                participants: response.participants,
                roomId: response.roomId,
            });
        }
    } else {
        throw new Error("Failed to send invitation");
    }
};
