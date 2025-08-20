import { Avatar } from "primereact/avatar";
import { InputIcon } from "primereact/inputicon";
import { Tooltip } from "primereact/tooltip";
import React from "react";

const Chat_Profile = () => {
    const [tooltipText, setTooltipText] = React.useState("Copy");
    const handleCopy = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setTooltipText("Copied!");
            setTimeout(() => {
                setTooltipText("Copy");
            }, 1000);
        } catch (err) {
            setTooltipText("Failed!");
        }
    };

    return (
        <div className="w-full flex items-center justify-between px-4">
            <Avatar
                image={
                    "https://yt3.ggpht.com/yti/ANjgQV8FcipRrroXPP6So9rSr4N7XG53ORkKjCBiOHHRMEqQc2Y=s108-c-k-c0x00ffffff-no-rj"
                }
                size="large"
                shape="circle"
            />
            <div>
                Chat code: abcd-efgh-ijkl-mnop
                <InputIcon
                    icon=""
                    className="pi pi-copy cursor-pointer chat-code"
                    onClick={handleCopy.bind(null, "abcd-efgh-ijkl-mnop")}
                    data-pr-tooltip={tooltipText}
                />
                <Tooltip target=".chat-code" ptOptions={{ position: "top" }} />
            </div>
        </div>
    );
};

export default Chat_Profile;
