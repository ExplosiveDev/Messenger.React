import { createContext } from "react";
import User from "../Models/User";
import { HubConnection } from "@microsoft/signalr";

interface AuthContextType {
    selectedChat: User | null;
    token: string | null;
    user: User | null;
    connection: HubConnection | null;
    login: (jwtToken: string, user: User) => void;
    logout: () => void;
    setSelectedChat: (user: User) => void;
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
