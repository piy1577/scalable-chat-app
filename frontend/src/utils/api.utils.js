const url = process.env.REACT_APP_SOCKET_URL;
const apiUtil = {
    get: async (relativeUrl) => {
        console.log("GET CALLED", relativeUrl);
        return await fetch(`${url}/api/${relativeUrl}`, {
            credentials: "include",
        });
    },

    post: async (relativeUrl, body) => {
        console.log("POST CALLED");
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
