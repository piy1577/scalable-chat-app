import { DataScroller } from "primereact/datascroller";
import { chat } from "./temp";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import Chat_Profile from "./Chat_Profile";

const Chat = () => {
    const itemTemplate = (data) => {
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
            <div className="overflow-y-auto">
                <DataScroller
                    value={chat}
                    itemTemplate={itemTemplate}
                    rows={50}
                    loader
                    buffer={0.4}
                />
            </div>
            <div className="flex w-full gap-3 p-2">
                <InputTextarea
                    placeholder="Type your message"
                    className="w-full fixed-textarea h-full"
                    autoResize={false}
                />

                <Button icon="pi pi-send" rounded />
            </div>
        </div>
    );
};

export default Chat;
