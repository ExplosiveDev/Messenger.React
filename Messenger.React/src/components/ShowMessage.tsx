import { FC, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Message from "../Models/Message";
import { format, parse } from "date-fns";
import useIndexedDBMessenger from "../hooks/indexedDbMessenger.hook";
import { MessengerContex } from "../context/MessegerContext";
import UserChat from "../Models/UserChat";

interface MessageProps {
    Message: Message;
}

const ShowMessage: FC<MessageProps> = ({ Message }) => {
    const auth = useContext(AuthContext);

    const { isTextMessage, isMediaMessage, isGroupChat } = useIndexedDBMessenger();

    const isMyMessage = auth.user?.id === Message.senderId;


    let formattedDate = "Invalid Date";
    if (Message.timestamp) {
        const date = parse(Message.timestamp, "dd.MM.yyyy HH:mm:ss", new Date());
        formattedDate = isNaN(date.getTime()) ? "Invalid Date" : format(date, "HH:mm");
    }

    let senderName = "";
    let senderAvatarUrl = "";
    if (isGroupChat(auth.selectedChat!) && auth.selectedChat?.userChats) {
        const senderUserChat = auth.selectedChat.userChats.find(
            (userChat: UserChat) => userChat.userId === Message.senderId
        );
        senderName = senderUserChat?.user?.userName || "Unknown";
        senderAvatarUrl = senderUserChat?.user?.activeAvatar.url || "/default-avatar.png";
    }

    return (
        <div className={`col-12 d-flex ${isMyMessage ? "justify-content-end" : "justify-content-start"} align-items-end`}>
            {!isMyMessage && isGroupChat(auth.selectedChat!) && (
                <img src={senderAvatarUrl} alt="avatar" className="avatar mb-1" />
            )}

            <div className={`message-box mt-2 ${isMyMessage ? "my-message" : "other-message"}`}>

                {isGroupChat(auth.selectedChat!) && !isMyMessage && (
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


        </div>
    );
};

export default ShowMessage;
