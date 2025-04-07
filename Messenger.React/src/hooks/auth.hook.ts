import { useCallback, useState, useEffect, useId } from "react"
import {secureLocalStorage} from "./secureLocalStorage.hook"
import User from "../Models/User";
import myFile from "../Models/File";


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

    const ChangeAvatar = (avatar:myFile) => {
        if (!user) return;
        console.log("Prop",avatar);
        // Оновлюємо активний аватар у стані
        const updatedUser = { ...user, activeAvatar: avatar };
        console.log(updatedUser);
        setUser(updatedUser);

        // Оновлюємо локальне збереження
        saveEncryptedObject(UserStorage, { user: updatedUser, token }, secretKey);
    }

    useEffect(() => {
        const data = getDecryptedObject(UserStorage,secretKey)
        // console.log(data);
        if (data && data.token) {
            login(data.token, data.user)
        }
    }, [login])




    return {getUserId, getToken, login, logout, token, user, ChangeAvatar};
}