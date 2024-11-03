import { useCallback, useState } from "react";
import Message from "../Models/Message";

export const useMessage = () => {
    const [messages, setMessages] = useState<Message[]>([]);

    const addNewMessage = useCallback( (newMessage: Message | null) : void => {
        if(newMessage != null)
        {
            setMessages((prevMessages) => [...prevMessages, newMessage]); 
            console.log("messages update (message.hook.ts)")            
        }
    },[])
              

    return {messages, addNewMessage};
}