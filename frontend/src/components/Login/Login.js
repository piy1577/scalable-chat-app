import { useState } from "react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import "./Login.css";
import { googleLogin } from "../../services/auth.service";

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    return (
        <div className="login-container">
            <div className="login-wrapper">
                <Card className="login-card">
                    <div className="login-header">
                        <h1>Login to Chat</h1>
                        <p>
                            Welcome! Please sign in with your Google account to
                            continue.
                        </p>
                    </div>

                    <div className="login-content">
                        {error && (
                            <div className="login-error">
                                <i className="pi pi-exclamation-triangle"></i>
                                <span>{error}</span>
                            </div>
                        )}

                        <Button
                            label={
                                loading
                                    ? "Signing in..."
                                    : "Sign in with Google"
                            }
                            icon="pi pi-google"
                            className="p-button-lg google-signin-btn"
                            onClick={googleLogin.bind(
                                null,
                                setLoading,
                                setError
                            )}
                            loading={loading}
                            disabled={loading}
                        />

                        <div className="login-footer">
                            <small>
                                By signing in, you agree to our Terms of Service
                                and Privacy Policy
                            </small>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Login;
