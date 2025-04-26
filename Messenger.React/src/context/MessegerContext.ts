import { createContext } from "react";
import Message from "../Models/Message";

interface MessengerContextType {
    message: Message | null;
    addNewMessage: (newMessage: Message | null) => void;
}

function noop() { }

const defaultAuthContext: MessengerContextType = {
    message: null,
    addNewMessage: noop,
};

export const MessengerContex = createContext(defaultAuthContext);