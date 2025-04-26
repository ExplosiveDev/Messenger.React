import { FC, useContext, useEffect, useState } from "react";
import Chat from "../Models/Chat";
import useIndexedDBMessenger from "../hooks/indexedDbMessenger.hook";
import User from "../Models/User";
import GroupChat from "../Models/GroupChat";
import { AuthContext } from "../context/AuthContext";

interface ChatHeaderProps{
    selectedChat:Chat;
    user:User
    onOpenChatInfo?: () => void;
}

const ChatHeader: FC<ChatHeaderProps> = ({selectedChat, user, onOpenChatInfo}) => {
    const auth = useContext(AuthContext);
    const [chatName, setChatName] = useState<string>();
    const handleOpenChatInformation = () => onOpenChatInfo?.();

    const { isGroupChat, isPrivateChat} = useIndexedDBMessenger()

    useEffect(() => {
        if (!auth.connection) return;
        const handleRemovedChat = (chatId: string, newChatName:string) => {
            if (selectedChat.id === chatId){
                setChatName(newChatName);
                auth.ChangeChatName(newChatName);
            }
        };
      
        auth.connection.on("ReceiveNewChatName", handleRemovedChat);
      
        return () => {
          auth.connection?.off("ReceiveNewChatName", handleRemovedChat);
        };
      }, [auth.connection]);
    
    useEffect(() => {
        if (isPrivateChat(selectedChat)) {
            const user1 = selectedChat.user1;
            const user2 = selectedChat.user2;
            const chatUser = user1.id === user?.id ? user2 : user1;
            setChatName(chatUser.userName);
        } else if (isGroupChat(selectedChat)) {
            setChatName(auth.selectedChat!.groupName);
        } else {
            setChatName("Unknown Chat");
        }
    }, [selectedChat]);


    return (
        <div className="chat-header d-flex " style={{cursor: "pointer"}} onClick={handleOpenChatInformation}>
            <img className="chat-photo me-2" src={isPrivateChat(selectedChat) ? (
                (() => {
                    const user1 = selectedChat.user1;
                    const user2 = selectedChat.user2;
                    const chatUser = user1.id === user?.id ? user2 : user1;
                    return chatUser.activeAvatar.url;
                })()
            ) : isGroupChat(selectedChat) ? (
                selectedChat.activeIcon?.url ? selectedChat.activeIcon.url : "default-avatar.png"
            ) : (
                "url..."
            )}
                alt="Chat" />
            <div className="row ">
                <div className="d-flex col-12 " >
                    <h4 className="m-0">{chatName}</h4>
                </div>
                <div className="d-flex col-12 " >
                    <h6 className="m-0 user-status">{isPrivateChat(selectedChat) ? "Online" : (selectedChat as GroupChat).userChats.length + " members"}</h6>
                </div>
            </div>
        </div>
    );
};

export default ChatHeader;