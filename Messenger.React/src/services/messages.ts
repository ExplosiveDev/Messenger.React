import axios from "axios";
import Message from "../Models/Message";


export const getAllMessages = async (token: string): Promise<Message[]> => {
    const response = await axios.get<Message[]>('https://localhost:7250/Messages/GetMessages', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    
    return response.data;
}
