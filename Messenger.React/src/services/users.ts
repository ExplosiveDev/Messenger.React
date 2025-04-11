import axios from "axios";
import User from "../Models/User";

export const getContacts = async (token: string): Promise<User[]> => {
    const response = await axios.get<User[]>('http://192.168.0.100:5187/Users/GetContacts', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
}

export const ChangeUserFields = async (token: string, newUserName: string): Promise<string> => {
    const response = await axios.post(
        'http://192.168.0.100:5187/Users/ChangeUserFields',
        newUserName,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }

    );
    return response.data;
}