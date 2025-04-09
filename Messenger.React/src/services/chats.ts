import axios from "axios";
import Chat from "../Models/Chat";
import PrivateChat from "../Models/PrivateChat";
import GroupChat from "../Models/GroupChat";
import ChatsCortage from "../Models/ResponsModels/ChatsCortage";
import searchedGlobalChats from "../Models/ResponsModels/SerchedGlobalChats";
import CreateGroupChatRequest from "../Models/RequestModels/CreateGroupChatReques";



export const getSavedChats = async (token:string): Promise<ChatsCortage | null> => {
    try {
        const response = await axios.get<ChatsCortage>(`http://192.168.0.100:5187/Chats/GetSavedChats`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const data = response.data;
        data.groupChats.forEach((chat) => {chat.isMessagesUpdate = false});
        data.privateChats.forEach((chat) => {chat.isMessagesUpdate = false});
        // console.log(data);
        return data;
    } catch (error) {
        console.error('Search failed:', error);
        return null;
    }
}

export const getChat = async (token:string, chatId:string): Promise<Chat> => {
    const response = await axios.get(
        `http://192.168.0.100:5187/Chats/GetChat`,
        {
            params: {
                chatId: chatId
            },
            headers: {
                Authorization: `Bearer ${token}`,
            }
        }
    );

    return response.data as Chat;
}

export const globalChatSearchByName = async (token:string, searchChatName:string): Promise<searchedGlobalChats> => {
    const response = await axios.get(`http://192.168.0.100:5187/Chats/GetGlobalChatsByName`, {
        params: { name: searchChatName },
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    console.log(response.data.privateChats);

    return response.data;
}

export const createPrivateChat = async (token:string, user2Id:string): Promise<PrivateChat> => {
    const response = await axios.post(
        `http://192.168.0.100:5187/Chats/CreatePrivateChat`,
        null,
        {
            params: {
                user2Id: user2Id
            },
            headers: {
                Authorization: `Bearer ${token}`,
            }
        }
    );

    return response.data as PrivateChat;
}

export const createGroupChat = async (token: string, createGroupChatRequest: CreateGroupChatRequest): Promise<GroupChat> => {
    const response = await axios.post(
        `http://192.168.0.100:5187/Chats/CreateGroupChat`,
        createGroupChatRequest,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }
    );

    return response.data;
};


