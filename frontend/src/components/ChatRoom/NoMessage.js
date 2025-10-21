import { useUsers } from "../../contexts/UserContext";

const NoMessage = () => {
    const { currentUser } = useUsers();
    return (
        <div className="no-messages">
            <div className="empty-state">
                <i
                    className="pi pi-inbox"
                    style={{
                        fontSize: "3rem",
                        color: "#ddd",
                        marginBottom: "1rem",
                    }}
                ></i>
                <h3>No messages yet</h3>
                <p>Start the conversation with {currentUser.name}!</p>
            </div>
        </div>
    );
};

export default NoMessage;
