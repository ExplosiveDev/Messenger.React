import { createContext } from "react";
import Message from "../Models/Message";
import User from "../Models/User";
import Chat from "../Models/Chat";

interface MessengerContextType {
    messages: Message[] | null;
    chats: Chat[] | null;
    addNewMessage: (newMessage: Message | null) => void;
    addNewChat: (newChat: Chat | null) => void
}

function noop() { }

const defaultAuthContext: MessengerContextType = {
    messages: null,
    chats : null,
    addNewMessage: noop,
    addNewChat: noop,
};

export const MessengerContex = createContext(defaultAuthContext);