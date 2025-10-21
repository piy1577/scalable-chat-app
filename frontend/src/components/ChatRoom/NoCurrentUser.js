const NoCurrentUser = () => {
    return (
        <div className="chat-room">
            <div className="no-contact-selected">
                <div className="empty-state">
                    <i
                        className="pi pi-comments"
                        style={{
                            fontSize: "4rem",
                            color: "#ddd",
                            marginBottom: "1.5rem",
                        }}
                    ></i>
                    <h2>Select a contact to start chatting</h2>
                    <p>
                        Choose someone from your contacts list to begin a
                        conversation
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NoCurrentUser;
