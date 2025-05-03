import axios from "axios";
import Chat from "../Models/Chat";
import PrivateChat from "../Models/PrivateChat";
import GroupChat from "../Models/GroupChat";
import ChatsCortage from "../Models/ResponsModels/ChatsCortage";
import searchedGlobalChats from "../Models/ResponsModels/SerchedGlobalChats";
import CreateGroupChatRequest from "../Models/RequestModels/CreateGroupChatReques";
import RemoveMemberRequest from "../Models/RequestModels/RemoveMemberRequest";
import ChangeChatNameRequest from "../Models/RequestModels/ChangeChatNameRequest";
import AddMembersRequest from "../Models/RequestModels/AddMembersRequest";
import User from "../Models/User";



export const getSavedChatsService = async (token:string): Promise<ChatsCortage | null> => {
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

export const getChatService = async (token:string, chatId:string): Promise<Chat> => {
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

export const globalChatSearchByNameService = async (token:string, searchChatName:string): Promise<searchedGlobalChats> => {
    const response = await axios.get(`http://192.168.0.100:5187/Chats/GetGlobalChatsByName`, {
        params: { name: searchChatName },
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    // console.log(response.data.privateChats);

    return response.data;
}

export const createPrivateChatService = async (token:string, user2Id:string): Promise<PrivateChat> => {
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

export const createGroupChatService = async (token: string, createGroupChatRequest: CreateGroupChatRequest): Promise<GroupChat> => {
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

export const RemoveMemberService = async (token: string, removeMemberRequest: RemoveMemberRequest): Promise<string | null> => {
    const response = await axios.post(
        `http://192.168.0.100:5187/Chats/RemoveMember`,
        removeMemberRequest,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }
    );

    return response.status === 200 ? response.data : null;
};

export const AddMembersService = async (token: string, addMemberRequest: AddMembersRequest): Promise<User[] | null> => {
    const response = await axios.post(
        `http://192.168.0.100:5187/Chats/AddMembers`,
        addMemberRequest,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }
    );

    return response.status === 200 ? response.data : null;
};

export const ChangeChatNameService = async (token: string, changeChatRequest: ChangeChatNameRequest): Promise<string | null> => {
    const response = await axios.post(
        `http://192.168.0.100:5187/Chats/ChangeChatName`,
        changeChatRequest,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }
    );

    return response.status === 200 ? response.data : null;
};


