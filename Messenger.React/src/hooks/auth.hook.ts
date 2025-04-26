import { useCallback, useState, useEffect, useId } from "react"
import {secureLocalStorage} from "./secureLocalStorage.hook"
import User from "../Models/User";
import myFile from "../Models/File";
import Chat from "../Models/Chat";


const UserStorage = 'userData';

const initState:User = {
    id: '',
    userName: '',
    phone: '',
    passwordHash: '',
    roles: [],
    messages:[],
    chats:[],
    activeAvatar: {} as myFile
};

export const useAuth = () => {
    const [token, setToken] = useState<string | null>();
    const [user, setUser] = useState<User | null>();
    const [selectedChat, _setSelectedChat] = useState<Chat | null>(null);
    const {secretKey, saveEncryptedObject, getDecryptedObject} = secureLocalStorage() 

    const login = useCallback((jwtToken: string, user: User) => {
        setToken(jwtToken);
        setUser(user);

        saveEncryptedObject(UserStorage,{user: user, token: jwtToken},secretKey);
    }, [])

    const logout = useCallback(() => {
        setToken("");
        setUser(initState);
        localStorage.removeItem(UserStorage);
    }, [])

    const getUserId = ():string => {
        const data:User = getDecryptedObject(UserStorage,secretKey).user;
        return data.id;
    }

    const getToken = ():string => {
        const token:string = getDecryptedObject(UserStorage,secretKey).token;
        return token;
    }

    useEffect(() => {
        const data = getDecryptedObject(UserStorage,secretKey)
        if (data && data.token) {
            login(data.token, data.user)
        }
    }, [login])

    const ChangeAvatar = (avatar:myFile) => {
        if (!user) return;
        const updatedUser = { ...user, activeAvatar: avatar };
        setUser(updatedUser);

        saveEncryptedObject(UserStorage, { user: updatedUser, token }, secretKey);
    }

    const ChangeUserName = (newUserName:string) => {
        if (!user) return;
        const updatedUser = { ...user, userName: newUserName };
        setUser(updatedUser);
        saveEncryptedObject(UserStorage, { user: updatedUser, token }, secretKey);
    }

    const setSelectedChat = (chat : Chat) => {
        if(chat != null){
            _setSelectedChat(chat);
            window.sessionStorage.setItem("selectedChatId", chat.id);
        }
    }

    const ChangeChatName = (newChatName: string) => {
        if (selectedChat) {
            console.log('Before update:', selectedChat);
            const updatedChat:Chat = { 
                ...selectedChat, 
                groupName: newChatName 
            }; 
            _setSelectedChat(updatedChat);
            
            console.log('After update:', selectedChat);
        }
    };


    return {getUserId, getToken, login, logout, ChangeAvatar, ChangeUserName, token, user, selectedChat, setSelectedChat,ChangeChatName};
}