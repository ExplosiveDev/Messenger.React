import axios from "axios";
import Message from "../Models/Message";


export const getAllMessages = async (token: string): Promise<Message[]> => {
    const response = await axios.get<Message[]>('http://192.168.0.100:5187/Messages/GetMessages', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    
    return response.data;
}

export const getMessagesByChatId = async (token: string, chatId:string): Promise<Message[]> => {
    const response = await axios.get<Message[]>('http://192.168.0.100:5187/Messages/GetMessagesByChat', {
        params:{
            chatId: chatId
        },
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    
    return response.data;
}
