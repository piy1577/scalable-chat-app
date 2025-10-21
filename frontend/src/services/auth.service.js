import apiUtil from "../utils/api.utils";

export const checkAuthStatus = async (setUser, setLoading) => {
    try {
        const response = await apiUtil.get("auth");
        if (response.ok) {
            const data = await response.json();
            setUser({ ...data, isActive: true });
        } else {
            setUser(null);
        }
    } catch (err) {
        console.error("Auth status check failed:", err);
        setUser(null);
    } finally {
        setLoading(false);
    }
};

export const logout = async (setUser) => {
    try {
        await apiUtil.get("auth/logout");
    } catch (error) {
        console.error("Logout error:", error);
    } finally {
        setUser(null);
    }
};

export const googleLogin = async (setLoading, setError) => {
    setLoading(true);
    setError("");
    try {
        window.location.href = "http://localhost:3001/api/auth/login";
    } catch (err) {
        console.error("Google sign-in error:", err);
        setError("Network error occurred. Please try again.");
    } finally {
        setLoading(false);
    }
};
