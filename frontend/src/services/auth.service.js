import apiUtil from "../utils/api.utils";

export const checkAuthStatus = async (setUser, setLoading) => {
    const response = await apiUtil.get("auth");
    if (response.ok) {
        const data = await response.json();
        setUser({ ...data, isActive: true });
    } else {
        setUser(null);
    }
    setLoading(false);
};

export const logout = async (setUser) => {
    await apiUtil.get("auth/logout");
    localStorage.removeItem("google_token");
    console.log("Token removed from localStorage");
    setUser(null);
};

export const googleLogin = async (setLoading, setError) => {
    setLoading(true);
    setError("");
    window.location.href = `${process.env.REACT_APP_SERVER_URL}/api/auth/login`;
    setLoading(false);
};

export const handleAuthCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (token) {
        localStorage.setItem("google_token", token);
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
    }
};
