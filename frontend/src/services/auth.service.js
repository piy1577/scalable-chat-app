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
    setUser(null);
};

export const googleLogin = async (setLoading, setError) => {
    setLoading(true);
    setError("");
    window.location.href = "http://localhost:3001/api/auth/login";
    setLoading(false);
};
