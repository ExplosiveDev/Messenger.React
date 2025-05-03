import { FC, useEffect, useRef, useState, useCallback } from "react";
import Message from "../Models/Message";
import { format, parse } from "date-fns";
import useIndexedDBMessenger from "../hooks/indexedDbMessenger.hook";
import UserChat from "../Models/UserChat";
import { useAppSelector } from "../store/store";
import { getChatById, getSearchedChatById } from "../store/features/chatService";
import MessageContextMenu from "./ContextMenue/MessageContextMenu";
import { AnimatePresence } from "framer-motion";

interface MessageProps {
    Message: Message;
}

const ShowMessage: FC<MessageProps> = ({ Message }) => {
    const selectedChatId = useAppSelector(state => state.selectedChat).chatId;
    const selectedChat = useAppSelector(state => getChatById(selectedChatId)(() => state))
        ? useAppSelector(state => getChatById(selectedChatId)(() => state))
        : useAppSelector(state => getSearchedChatById(selectedChatId)(() => state));

    const user = useAppSelector(state => state.user).user;

    const { isTextMessage, isMediaMessage, isGroupChat } = useIndexedDBMessenger();

    const isMyMessage = user?.id === Message.senderId;

    let formattedDate = "Invalid Date";
    if (Message.timestamp) {
        const date = parse(Message.timestamp, "dd.MM.yyyy HH:mm:ss", new Date());
        formattedDate = isNaN(date.getTime()) ? "Invalid Date" : format(date, "HH:mm");
    }

    let senderName = "";
    let senderAvatarUrl = "";
    if (selectedChat && isGroupChat(selectedChat) && selectedChat.userChats) {
        const senderUserChat = selectedChat.userChats.find(
            (userChat: UserChat) => userChat.userId === Message.senderId
        );
        senderName = senderUserChat?.user?.userName || "Unknown";
        senderAvatarUrl = senderUserChat?.user?.activeAvatar.url || "/default-avatar.png";
    }

    const messageRef = useRef<HTMLDivElement>(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    // Закриття меню при кліку поза ним
    const handleClickOutside = useCallback((e: MouseEvent) => {
        if (messageRef.current && !messageRef.current.contains(e.target as Node)) {
            setMenuVisible(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [handleClickOutside]);


    const handleContextMenu = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        
        const x = Math.min(e.clientX, window.innerWidth - 180);
        const y = Math.min(e.clientY, window.innerHeight - 200);
        
        setMenuPosition({ x, y });
        setMenuVisible(true);
      };

    return (
        <div className={`col-12 d-flex ${isMyMessage ? "justify-content-end" : "justify-content-start"} align-items-end`}>
            {!isMyMessage && isGroupChat(selectedChat!) && (
                <img src={senderAvatarUrl} alt="avatar" className="avatar-mini mb-1" />
            )}

            <div
                className={`message-box mt-2 ${isMyMessage ? "my-message" : "other-message"}`}
                ref={messageRef}
                onContextMenu={handleContextMenu}
            >
                {isGroupChat(selectedChat!) && !isMyMessage && (
                    <div className="sender-name">{senderName}</div>
                )}

                {isTextMessage(Message) && (
                    <>
                        <p className={`message-content ${isMyMessage ? "text-end" : "text-start "}`}>{Message.content}</p>
                        <div className={`message-footer ${isMyMessage ? "justify-content-start" : "justify-content-end"}`}>
                            <span className="message-date">{formattedDate}</span>
                        </div>
                    </>
                )}

                {isMediaMessage(Message) && Array.isArray(Message.content) && Message.content.length > 0 && (
                    <div className="media-message">
                        <img
                            src={Message.content[0]?.url || ""}
                            alt="Media"
                            onError={(e) => (e.currentTarget.src = "/fallback-image.png")}
                        />

                        {Message.caption && (
                            <div className="message-footer justify-content-start">
                                <span className="message-caption">{Message.caption}</span>
                            </div>
                        )}

                        <div className="message-footer">
                            <span className="message-date">{formattedDate}</span>
                        </div>
                    </div>
                )}
            </div>

            <AnimatePresence>
            {menuVisible && (
                <MessageContextMenu
                    position={menuPosition}
                    message={Message}
                    onClose={() => setMenuVisible(false)} // Додано для закриття меню
                />
            )}
            </AnimatePresence>
        </div>
    );
};

export default ShowMessage;