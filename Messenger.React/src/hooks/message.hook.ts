import { useCallback, useState } from "react";
import Message from "../Models/Message";
import User from "../Models/User";
import Chat from "../Models/Chat";

export const useMessage = () => {
    const [message, setMessage] = useState<Message>();
    const [chats, setChats] = useState<Chat[]>([]);

    const addNewMessage = (newMessage: Message | null): void => {
        if (!newMessage) return;
        setMessage(newMessage);
    }

    const addNewChat = (newChat: Chat | null): void => {
        if (!newChat) return;

    setChats((prevChats) => [...prevChats, newChat]);
    }

    const initChats = (newChats: Chat[] | null): void => {
        if (newChats != null) {
            setChats(newChats);
        }
    }



    return { message, chats, addNewMessage, addNewChat, initChats };
}