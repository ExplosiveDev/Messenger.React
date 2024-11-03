import { createContext } from "react";
import Message from "../Models/Message";

interface MessageContextType {
    messages: Message[] | null;
    addNewMessage: (newMessage: Message | null) => void;
}

function noop() { }

const defaultAuthContext: MessageContextType = {
    messages: null,
    addNewMessage: noop,
};

export const MessageContex = createContext(defaultAuthContext);