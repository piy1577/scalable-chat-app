const Loading = () => {
    return (
        <div className="loading-container">
            <div className="loading-spinner">
                <i
                    className="pi pi-spin pi-spinner"
                    style={{ fontSize: "2rem" }}
                ></i>
                <p>Loading...</p>
            </div>
        </div>
    );
};

export default Loading;
