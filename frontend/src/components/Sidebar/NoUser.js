const NoUser = () => {
    return (
        <div className="no-contacts">
            <div className="empty-state">
                <i
                    className="pi pi-user-plus"
                    style={{
                        fontSize: "3rem",
                        color: "#ddd",
                        marginBottom: "1rem",
                    }}
                ></i>
                <h3>No contacts yet</h3>
                <p>Invite someone to start chatting!</p>
            </div>
        </div>
    );
};

export default NoUser;
