import {
    useState,
    useRef,
    useEffect,
    forwardRef,
    useImperativeHandle,
} from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import "./MessageInput.css";
import { useSocket } from "../../contexts/SocketContext";
import { useUsers } from "../../contexts/UserContext";

const MessageInput = forwardRef(
    ({ onSendMessage, disabled, placeholder }, ref) => {
        const [message, setMessage] = useState("");
        const textareaRef = useRef(null);
        useImperativeHandle(ref, () => ({
            focus: () => {
                if (textareaRef.current) {
                    textareaRef.current.focus();
                }
            },
        }));

        const [isTyping, setIsTyping] = useState(false);
        const [typingTimeout, setTypingTimeout] = useState(null);
        const { socket } = useSocket();
        const { currentUser } = useUsers();

        useEffect(() => {
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
                textareaRef.current.style.height =
                    textareaRef.current.scrollHeight + "px";
            }
        }, [message]);

        const handleSubmit = (e) => {
            e.preventDefault();
            if (message.trim() && !disabled) {
                onSendMessage(message.trim());
                setMessage("");
                setIsTyping(false);

                if (textareaRef.current) {
                    textareaRef.current.style.height = "auto";
                }
            }
        };

        const handleKeyPress = (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
            }
        };

        const handleInputChange = (e) => {
            setMessage(e.target.value);
            if (!isTyping) {
                setIsTyping(true);
                socket.emit("start_typing", { roomId: currentUser?.roomId });
            }

            if (typingTimeout) clearTimeout(typingTimeout);
            const timeout = setTimeout(() => {
                socket.emit("stop_typing", { roomId: currentUser?.roomId });
                setIsTyping(false);
            }, 1500);
            setIsTyping(timeout);
        };

        return (
            <form onSubmit={handleSubmit} className="message-input-form">
                <div className="message-input-container">
                    <div className="input-wrapper">
                        <InputTextarea
                            ref={textareaRef}
                            value={message}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            placeholder={placeholder}
                            disabled={disabled}
                            className="message-textarea"
                            autoResize={false}
                            rows={1}
                            maxLength={1000}
                        />
                    </div>

                    <div className="send-button-container">
                        <Button
                            type="submit"
                            icon="pi pi-send"
                            className="send-button"
                            disabled={disabled || !message.trim()}
                            aria-label="Send message"
                        />
                    </div>
                </div>

                {message.length > 800 && (
                    <div className="character-count">
                        <small
                            className={
                                message.length > 1000 ? "error" : "warning"
                            }
                        >
                            {message.length}/1000
                        </small>
                    </div>
                )}
            </form>
        );
    }
);

export default MessageInput;
