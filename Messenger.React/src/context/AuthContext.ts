import { createContext } from "react";
import User from "../Models/User";
import { HubConnection } from "@microsoft/signalr";
import Chat from "../Models/Chat";

interface AuthContextType {
    selectedChat: Chat | null;
    token: string | null;
    user: User | null;
    connection: HubConnection | null;
    login: (jwtToken: string, user: User) => void;
    logout: () => void;
    setSelectedChat: (user: Chat) => void;
    isAuthenticated: boolean;  
}

function noop() { }

const defaultAuthContext: AuthContextType = {
    selectedChat: null,
    token: null,
    user: null,
    connection: null,
    login: noop,
    logout: noop,
    setSelectedChat: noop,
    isAuthenticated: false,
};

export const AuthContext = createContext(defaultAuthContext);
