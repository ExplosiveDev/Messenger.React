import axios from "axios";
import Chat from "../Models/Chat";
import PrivateChat from "../Models/PrivateChat";
import GroupChat from "../Models/GroupChat";
import ChatsCortage from "../Models/ChatsCortage";



export const getSavedChats = async (token:string): Promise<ChatsCortage | null> => {
    try {
        const response = await axios.get<ChatsCortage>(`http://192.168.0.100:5187/Chats/GetSavedChats`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = response.data;
        // console.log(data);
        data.groupChats.forEach((chat) => {chat.isMessagesUpdate = false});
        data.privateChats.forEach((chat) => {chat.isMessagesUpdate = false});
        return data;
    } catch (error) {
        console.error('Search failed:', error);
        return null;
    }
}