import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import User from "../../Models/User";
import { secureLocalStorage } from "../../hooks/secureLocalStorage.hook";
import myFile from "../../Models/File";

export interface UserState{
    user:User | null,
    token:string,
}

const initialState:UserState = {
    user: null,
    token: '',
}

const UserStorage = 'userData';
const {secretKey, saveEncryptedObject, getDecryptedObject} = secureLocalStorage() 

export const UserSlice = createSlice({
    name:"user",
    initialState,
    reducers:{
        initUserData: (state) => {
            const decrypted = getDecryptedObject(UserStorage, secretKey);
            if(decrypted && decrypted.user && decrypted.token){
                state.user = decrypted.user;
                state.token = decrypted.token;
            }

        },
        login: (state, action:PayloadAction<{token: string, user: User}>) => {
            const {user, token} = action.payload;
            saveEncryptedObject(UserStorage,{user: user, token: token},secretKey);
            state.user = user;
            state.token = token;
        },
        logout: (state) => {
            state.user = null;
            state.token = '';
            localStorage.removeItem(UserStorage);
        },
        changeUserName:(state, action:PayloadAction<{newUserName: string}>) => {
            if (state.user) {
                state.user.userName = action.payload.newUserName;
            }
        },
        changeUserAvatar:(state, action:PayloadAction<{newAvatar: myFile}>) => {
            if (state.user) {
                state.user.activeAvatar = action.payload.newAvatar;
            }
        }
    }
});

export default UserSlice.reducer;
export const { initUserData, login, logout, changeUserName, changeUserAvatar } = UserSlice.actions;
