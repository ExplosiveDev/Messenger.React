import { createContext } from "react";
import User from "../Models/User";
import { HubConnection } from "@microsoft/signalr";
import Chat from "../Models/Chat";
import myFile from "../Models/File";

interface AuthContextType {
    selectedChat: Chat | null;
    token: string | null;
    user: User | null;
    connection: HubConnection | null;
    login: (jwtToken: string, user: User) => void;
    logout: () => void;
    setSelectedChat: (user: Chat) => void;
    isAuthenticated: boolean;  
    ChangeAvatar: (avatar:myFile) => void;
    ChangeUserName: (newUserName:string) => void;
    ChangeChatName: (newChatName:string) => void;
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
    ChangeAvatar: noop,
    ChangeUserName: noop,
    ChangeChatName: noop
};

export const AuthContext = createContext(defaultAuthContext);
