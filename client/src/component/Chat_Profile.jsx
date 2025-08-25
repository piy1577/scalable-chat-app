import { Avatar } from "primereact/avatar";

const Chat_Profile = () => {
    return (
        <div className="w-full flex items-center gap-3 px-4">
            <Avatar
                image={
                    "https://yt3.ggpht.com/yti/ANjgQV8FcipRrroXPP6So9rSr4N7XG53ORkKjCBiOHHRMEqQc2Y=s108-c-k-c0x00ffffff-no-rj"
                }
                size="large"
                shape="circle"
            />
            <div>
                <div className="font-bold">Piyush *</div>
            </div>
        </div>
    );
};

export default Chat_Profile;
