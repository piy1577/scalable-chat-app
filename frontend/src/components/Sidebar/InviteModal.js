import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import "./InviteModal.css";
import { inviteUser } from "../../services/user.service";

const InviteModal = ({ visible, onHide }) => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setError("Please enter an email address");
            return;
        }

        if (!validateEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await inviteUser(email.trim());
            setEmail("");
            onHide();
        } catch (err) {
            setError(err.message || "Failed to send invitation");
        } finally {
            setLoading(false);
        }
    };

    const handleHide = () => {
        setEmail("");
        setError("");
        setLoading(false);
        onHide();
    };

    return (
        <Dialog
            visible={visible}
            onHide={handleHide}
            header="Invite User to Chat"
            style={{ width: "400px" }}
            modal
            closable={!loading}
            dismissableMask={true}
            closeOnEscape={!loading}
            draggable={false}
            resizable={false}
        >
            <form onSubmit={handleSubmit} className="invite-form">
                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <div className="input-container">
                        <InputText
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email address"
                            className="w-full theme-input"
                            disabled={loading}
                            autoFocus
                        />
                    </div>
                </div>

                {error && (
                    <Message severity="error" text={error} className="mb-3" />
                )}

                <div className="form-actions">
                    <Button
                        type="button"
                        label="Cancel"
                        onClick={handleHide}
                        className="p-button-text mr-2"
                        disabled={loading}
                    />
                    <Button
                        type="submit"
                        label="Send Invitation"
                        loading={loading}
                        disabled={!email.trim() || !validateEmail(email)}
                    />
                </div>
            </form>
        </Dialog>
    );
};

export default InviteModal;
