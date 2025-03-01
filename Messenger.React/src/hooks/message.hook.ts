import { useCallback, useState } from "react";
import Message from "../Models/Message";
import User from "../Models/User";
import Chat from "../Models/Chat";

export const useMessage = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [chats, setChats] = useState<Chat[]>([]);

    const addNewMessage = useCallback((newMessage: Message | null): void => {
        if (newMessage != null) {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
            // console.log("messages update (message.hook.ts)")
        }
    }, [])

    const addNewChat = useCallback((newChat: Chat | null): void => {
        if (newChat != null)
            chats.push(newChat)
    }, [])

    const initChats = useCallback((newChats: Chat[] | null): void => {
        if (newChats != null) {
            setChats(newChats);
            // console.log("chats update (message.hook.ts)")
        }
    }, [])


    return { messages, chats, addNewMessage,addNewChat,initChats };
}