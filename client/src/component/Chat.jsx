import { chat } from "./temp";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import Chat_Profile from "./Chat_Profile";
import React from "react";

const Chat = () => {
    const [chats, setChats] = React.useState(chat);
    const [message, setMessage] = React.useState("");
    const chatRef = React.useRef(null);

    React.useEffect(() => {
        if (chatRef.current) {
            console.log("running");
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [chats]);

    const ItemTemplate = ({ data }) => {
        return (
            <div
                className={`inline-flex flex-col max-w-[min(24rem,100%)] ${
                    data.self ? "ml-auto" : ""
                }`}
            >
                <div
                    className={`flex flex-col ${
                        data.self ? "items-end" : "items-start"
                    }`}
                >
                    <div
                        className={`text-sm text-900 truncate max-w-full ${
                            data.self ? "text-right" : ""
                        } overflow-hidden`}
                    >
                        {data.name}
                    </div>

                    <div
                        className={`text-900 text-xl break-all text-white p-3 mt-1 max-w-full ${
                            data.self
                                ? "rounded-br-lg rounded-s-lg bg-neutral-700"
                                : "rounded-e-lg rounded-bl-lg bg-green-500"
                        }`}
                    >
                        {data.message}
                    </div>
                </div>
            </div>
        );
    };

    const addMessage = () => {
        setChats((t) => [
            ...t,
            {
                name: "Piyush",
                message,
                seen: true,
                time: new Date(),
                self: true,
            },
        ]);
        setMessage("");
    };
    const handleChange = (e) => {
        if (e.key === "Enter") {
            if (!e.shiftKey) {
                e.preventDefault();
                if (message.trim() !== "") {
                    addMessage();
                    setMessage("");
                }
            }
        }
    };
    /*
     * div starts from bottom
     * show message send time on messages
     * if 1 person sends consecutive message then name should not be seen for every message
     * show date before first message
     * tick for seen
     * update scrollbar
     */
    return (
        <div className="card grid grid-rows-[5rem_auto_4.1rem] justify-stretch w-full h-full">
            <Chat_Profile />
            <div ref={chatRef} className="overflow-y-auto bg-slate-50 ">
                <div className="flex flex-col">
                    {chats.map((c, i) => (
                        <ItemTemplate key={i} data={c} />
                    ))}
                </div>
            </div>
            <div className="flex w-full gap-3 p-2">
                <InputTextarea
                    placeholder="Type your message"
                    className="w-full fixed-textarea h-full"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleChange}
                    autoResize={false}
                />

                <Button icon="pi pi-send" rounded onClick={addMessage} />
            </div>
        </div>
    );
};

export default Chat;
