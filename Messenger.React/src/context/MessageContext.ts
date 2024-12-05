import { createContext } from "react";
import Message from "../Models/Message";
import User from "../Models/User";

interface MessageContextType {
    messages: Message[] | null;
    chats: User[] | null;
    addNewMessage: (newMessage: Message | null) => void;
    addNewChat: (newChat: User | null) => void
}

function noop() { }

const defaultAuthContext: MessageContextType = {
    messages: null,
    chats : null,
    addNewMessage: noop,
    addNewChat: noop,
};

export const MessageContex = createContext(defaultAuthContext);