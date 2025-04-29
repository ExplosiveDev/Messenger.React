import { FC, useContext, useEffect, useState } from "react";
import useIndexedDBMessenger from "../hooks/indexedDbMessenger.hook";
import User from "../Models/User";
import GroupChat from "../Models/GroupChat";
import { AuthContext } from "../context/AuthContext";
import { useAppDispatch, useAppSelector } from "../store/store";
import { getChatById } from "../store/features/chatService";
import { changeChatName } from "../store/features/chatSlice";
import Chat from "../Models/Chat";
import axios from "axios";

interface ChatHeaderProps {
    user: User
    onOpenChatInfo?: () => void;
}

const ChatHeader: FC<ChatHeaderProps> = ({ user, onOpenChatInfo }) => {
    const selectedChatId = useAppSelector(state => state.selectedChat).chatId;
    const dispatch = useAppDispatch();
    const selectedChat = useAppSelector(state => getChatById(selectedChatId!)(() => state));

    const auth = useContext(AuthContext);
    const [chatName, setChatName] = useState<string>();
    const handleOpenChatInformation = () => onOpenChatInfo?.();

    const { isGroupChat, isPrivateChat } = useIndexedDBMessenger()

    useEffect(() => {
        if (!auth.connection) return;
        const handleRenameChatName = async (chatId: string, newChatName: string) => {
            dispatch(changeChatName({ chatId: chatId, newChatName: newChatName }));
        };

        auth.connection.on("ReceiveNewChatName", handleRenameChatName);

        return () => {
            auth.connection?.off("ReceiveNewChatName", handleRenameChatName);
        };
    }, [auth.connection]);
    useEffect(() => {
        if (!selectedChat) return;
        setChatName(computeChatName(selectedChat));
    }, [selectedChat,user]);

    const computeChatName = (chat: Chat): string => {
        if (isPrivateChat(chat)) {
            const user1 = chat.user1;
            const user2 = chat.user2;
            return user1.id === user.id ? user2.userName : user1.userName;
        }
        if (isGroupChat(chat)) return chat.groupName;
        return "Unknown Chat";
    };

    const getChatImage = (): string => {
        if(!selectedChat) return '';
        if (isPrivateChat(selectedChat)) {
            const chatUser = selectedChat.user1.id === user.id ? selectedChat.user2 : selectedChat.user1;
            return chatUser.activeAvatar?.url || "default-avatar.png";
        }
        if (isGroupChat(selectedChat)) return selectedChat.activeIcon?.url || "default-avatar.png";
        return "default-avatar.png";
    };

    return (
        <div className="chat-header d-flex " style={{ cursor: "pointer" }} onClick={handleOpenChatInformation}>
            <img className="chat-photo me-2" src={getChatImage()}
                alt="Chat" />
            <div className="row ">
                <div className="d-flex col-12 " >
                    <h4 className="m-0">{chatName}</h4>
                </div>
                <div className="d-flex col-12 " >
                    <h6 className="m-0 user-status">{selectedChat && isPrivateChat(selectedChat) ? "Online" : (selectedChat as GroupChat).userChats.length + " members"}</h6>
                </div>
            </div>
        </div>
    );
};

export default ChatHeader;