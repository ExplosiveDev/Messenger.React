import { useCallback, useState } from "react";
import Message from "../Models/Message";
import User from "../Models/User";
import Chat from "../Models/Chat";

export const useMessage = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [chats, setChats] = useState<Chat[]>([]);

    const addNewMessage = (newMessage: Message | null): void => {
        if (newMessage != null) {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
            // console.log("messages update (message.hook.ts)")
        }
    }

    const addNewChat = (newChat: Chat | null): void => {
        if (newChat != null)
            chats.push(newChat)
    }

    const initChats = useCallback((newChats: Chat[] | null): void => {
        if (newChats != null) {
            setChats(newChats);
            // console.log("chats update (message.hook.ts)")
        }
    }, [])

    const markReadedMessages = (ids: string[] | null): void => {
        if (!ids || ids.length === 0) return; // Перевірка на null або порожній масив

        setMessages(prevMessages =>
            prevMessages.map(msg =>
                ids.includes(msg.id) ? { ...msg, isReaded: true } : msg
            )
        );
    }

    return { messages, chats, addNewMessage,addNewChat,initChats, markReadedMessages };
}