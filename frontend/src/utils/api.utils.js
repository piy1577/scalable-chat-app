const url = process.env.REACT_APP_SERVER_URL;
const apiUtil = {
    get: async (relativeUrl) => {
        return await fetch(`${url}/api/${relativeUrl}`, {
            credentials: "include",
        });
    },

    post: async (relativeUrl, body) => {
        return await fetch(`${url}/api/${relativeUrl}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
            credentials: "include",
        });
    },
};

export default apiUtil;
