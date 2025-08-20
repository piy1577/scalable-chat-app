import { useState, useRef } from "react";
import { DataView } from "primereact/dataview";
import { ScrollPanel } from "primereact/scrollpanel";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { products } from "./temp";
import { TieredMenu } from "primereact/tieredmenu";
import { Avatar } from "primereact/avatar";

export default function Sidebar() {
    const menu = useRef(null);
    const [code, setCode] = useState(false);
    const [email, setEmail] = useState(false);
    const item = [
        {
            label: "Add with Email",
            command: () => setEmail((t) => !t),
        },
        {
            label: "Join with Code",
            command: () => setCode((t) => !t),
        },
        {
            label: "Sign out",
        },
    ];
    const itemTemplate = (item) => {
        return (
            <>
                <div className="flex p-5 items-center cursor-pointer hover:bg-black/10 transition gap-3">
                    <img
                        className="w-10 h-10 shadow-2 flex-shrink-0 rounded-full"
                        src={`${item.image}`}
                        alt={item.name}
                    />
                    <div className="flex-1 flex flex-col gap-1 xl:mr-8">
                        <span className="font-bold">{item.name}</span>
                        <div className="flex align-items-center gap-2">
                            {item.message}
                        </div>
                    </div>
                </div>
            </>
        );
    };
    const centerContent = (
        <span className="grid grid-cols-[3.5rem_auto_10px] justify-strech w-full items-center">
            <Avatar
                image={
                    "https://yt3.ggpht.com/yti/ANjgQV8FcipRrroXPP6So9rSr4N7XG53ORkKjCBiOHHRMEqQc2Y=s108-c-k-c0x00ffffff-no-rj"
                }
                size="large"
                shape="circle"
            />
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText placeholder="Search" className="w-full" />
            </IconField>
            <InputIcon
                className="pi pi-ellipsis-v ml-3 cursor-pointer"
                onClick={(e) => menu.current.toggle(e)}
            />
        </span>
    );
    return (
        <ScrollPanel style={{ height: "100%", width: "100%" }}>
            <DataView
                style={{ width: "100%" }}
                value={products}
                header={centerContent}
                listTemplate={(item) => <>{item.map(itemTemplate)}</>}
            ></DataView>
            <TieredMenu model={item} popup ref={menu} breakpoint="767px" />
            <Dialog
                header="Join Room"
                visible={code}
                style={{ width: "25vw" }}
                onHide={() => {
                    if (!code) return;
                    setCode(false);
                }}
            >
                <div className="flex flex-col gap-2">
                    <label htmlFor="username">Chat Code: </label>
                    <InputText id="username" aria-describedby="username-help" />
                    <small id="username-help">
                        Enter the Chat Code to join room
                    </small>
                    <Button type="submit" label="Submit" className="self-end" />
                </div>
            </Dialog>
            <Dialog
                header="Chat with Email:"
                visible={email}
                style={{ width: "25vw" }}
                onHide={() => {
                    if (!email) return;
                    setEmail(false);
                }}
            >
                <div className="flex flex-col gap-2">
                    <label htmlFor="email">Email id: </label>
                    <InputText
                        type="email"
                        id="email"
                        aria-describedby="email-help"
                    />
                    <small id="email-help">
                        Enter the Email with whom to chat
                    </small>
                    <Button type="submit" label="Submit" className="self-end" />
                </div>
            </Dialog>
        </ScrollPanel>
    );
}
