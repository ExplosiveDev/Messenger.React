import { useCallback, useState, useEffect, useId } from "react"
import {secureLocalStorage} from "./secureLocalStorage.hook"
import User from "../Models/User";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";


const UserStorage = 'userData';

const initState:User = {
    id: '',
    userName: '',
    phone: '',
    passwordHash: '',
    roles: [],
    messages:[],
    chats:[]
};

export const useAuth = () => {
    const [token, setToken] = useState<string | null>();
    const [user, setUser] = useState<User | null>();
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

    useEffect(() => {
        const data = getDecryptedObject(UserStorage,secretKey)
 
        if (data && data.token) {
            login(data.token, data.user)
        }
    }, [login])




    return {getUserId, login, logout, token, user};
}