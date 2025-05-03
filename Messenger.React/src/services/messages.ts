import axios from "axios";
import Message from "../Models/Message";
import MessagesCortage from "../Models/ResponsModels/MessagesCortage"; 
import SendTextMessageRequest from "../Models/RequestModels/SendTextMessageRequest";
import TextMessage from "../Models/TextMessage";
import SendMediaMessageRequest from "../Models/RequestModels/SendMediaMessageRequest";
import MediaMessage from "../Models/MediaMessage";


export const GetAllMessagesService = async (token: string): Promise<Message[]> => {
    const response = await axios.get<Message[]>('http://192.168.0.100:5187/Messages/GetMessages', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    
    return response.data;
}

export const GetMessagesByChatIdService = async (token: string, chatId:string): Promise<MessagesCortage> => {
    const response = await axios.get<MessagesCortage>('http://192.168.0.100:5187/Messages/GetMessagesByChat', {
        params:{
            chatId: chatId
        },
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    // console.log(response.data);
    return response.data;
}

export const SendTextMessageService = async (token: string, sendTextMessageRequest:SendTextMessageRequest): Promise<TextMessage | null> => {
    const response = await axios.post(
        `http://192.168.0.100:5187/Messages/SendTextMessage`,
        sendTextMessageRequest,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }
    );

    return response.status === 200 ? response.data : null;
}

export const SendMediaMessageService = async (token: string, sendMediaMessageRequest:SendMediaMessageRequest): Promise<MediaMessage | null> => {
    const response = await axios.post(
        `http://192.168.0.100:5187/Messages/SendMediaMessage`,
        sendMediaMessageRequest,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }
    );

    return response.status === 200 ? response.data : null;
}
