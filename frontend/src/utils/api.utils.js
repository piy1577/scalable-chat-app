const url = process.env.REACT_APP_SERVER_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem('google_token');
    const headers = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

const handleTokenRefresh = (response) => {
    const newToken = response.headers.get('X-New-Token');
    if (newToken) {
        localStorage.setItem('google_token', newToken);
        console.log('Token refreshed and stored in localStorage');
    }
    return response;
};

const apiUtil = {
    get: async (relativeUrl) => {
        const response = await fetch(`${url}/api/${relativeUrl}`, {
            headers: getAuthHeaders(),
        });
        return handleTokenRefresh(response);
    },

    post: async (relativeUrl, body) => {
        const response = await fetch(`${url}/api/${relativeUrl}`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(body),
        });
        return handleTokenRefresh(response);
    },
};

export default apiUtil;
