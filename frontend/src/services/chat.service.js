import apiUtil from "../utils/api.utils";

export const getMessages = async (
    roomId,
    setMessages,
    setHasMore,
    page,
    setPage,
    load
) => {
    const response = await apiUtil.get(`user/${roomId}?page=${page}`);
    const messages = await response.json();
    if (messages && Array.isArray(messages?.messages)) {
        if (load) {
            setMessages((t) => [...messages?.messages, ...t]);
        } else {
            setMessages(messages?.messages);
        }
        if (setHasMore) setHasMore(messages?.pagination?.hasMore || false);
        if (setPage) setPage((t) => t + 1);
    } else {
        setMessages([]);
    }
};
