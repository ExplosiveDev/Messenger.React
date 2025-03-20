import { createContext } from "react";
import Message from "../Models/Message";
import User from "../Models/User";
import Chat from "../Models/Chat";

interface MessengerContextType {
    message: Message | null;
    chats: Chat[] | null;
    addNewMessage: (newMessage: Message | null) => void;
    addNewChat: (newChat: Chat | null) => void;
    initChats:(newChats: Chat[] | null) => void;
}

function noop() { }

const defaultAuthContext: MessengerContextType = {
    message: null,
    chats : null,
    addNewMessage: noop,
    addNewChat: noop,
    initChats: noop,
};

export const MessengerContex = createContext(defaultAuthContext);