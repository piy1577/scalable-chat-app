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

export const inviteUser = async (email) => {
    try {
        await apiUtil.post("user", { email });
    } catch (error) {
        console.error("Error sending invitation:", error);
    }
};
