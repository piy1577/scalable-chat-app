import apiUtil from "../utils/api.utils";

export const getMessages = async (roomId, setMessages) => {
    try {
        const response = await apiUtil.get(`user/${roomId}`);
        const messages = await response.json();
        setMessages(messages.messages);
    } catch (err) {
        console.error(err);
    }
};
