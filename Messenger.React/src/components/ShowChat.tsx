import { FC, MouseEvent, useContext, useEffect, useState } from "react";
import User from "../Models/User";
import { AuthContext } from "../context/AuthContext";
import Chat from "../Models/Chat";
import Message from "../Models/Message";
import { getMessagesByChatId } from "../services/messages";
import useIndexedDBMessenger from "../hooks/indexedDbMessenger.hook";

interface ChatProps {
    Chat: Chat;
    ChatName:string;
    dbOpened:boolean;
}

const ShowChat: FC<ChatProps> = ({ Chat, ChatName, dbOpened }) => {
    const auth = useContext(AuthContext);
    const { getMessage, db, addMessage, fillMessagesToChat } = useIndexedDBMessenger()

    const selectChat = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        auth.setSelectedChat(Chat);
    };
    


    useEffect(() => {
        const fetchMessages = async () => {
            if (!dbOpened || !auth.selectedChat) return;
            try {
                const messages: Message[] = await getMessagesByChatId(auth.token!, auth.selectedChat.id);
                console.log(messages)
                fillMessagesToChat(auth.selectedChat.id, messages);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };
        fetchMessages();
    }, [dbOpened, auth.selectedChat]);  

    return (
        <div className="col-12 my-1 ">
            <button
                className="btn w-100 chat-hover  "
                type="button"
                onClick={selectChat}
                
            >
                <h3 className="chat-name m-0 text-start">{ChatName}</h3>
            </button>

        </div>
    )

};

export default ShowChat;