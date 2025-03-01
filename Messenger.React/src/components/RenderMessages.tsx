import { ChangeEvent, FC, FormEvent, useContext, useEffect, useState } from "react";

import { AuthContext } from "../context/AuthContext";
import Message from "../Models/Message";
import ShowMessage from "./ShowMessage";
import { MessengerContex } from "../context/MessegerContext";
import useIndexedDBMessenger from "../hooks/indexedDbMessenger.hook";

interface ChatProps {
    ChatId: string;
}

const RenderMessages: FC<ChatProps> = ({ChatId}) => {

    const auth = useContext(AuthContext);
    const messageContext = useContext(MessengerContex);

    const { openDb, getMessage, getMessagesByChatId, db, addMessage } = useIndexedDBMessenger()
    const [messages, setMessages] = useState<Message[]>([])
    const [dbOpened, setDbOpened] = useState(false);

    useEffect(() => {
        const initDb = async () => {
            try {
                await openDb(); 
                setDbOpened(true);
            } catch (error) {
                console.error("Error opening IndexedDB:", error);
            }
        };
        initDb();
    }, []); 
    
    useEffect(() => {
        const fetchMessages = async () => {
            if (!dbOpened) return; 
            try {
                const messages: Message[] = await getMessagesByChatId(ChatId);
                //console.log(messages);
                setMessages(messages);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };
        fetchMessages();
    }, [dbOpened, ChatId, messageContext.messages]); 
    



    return (
        <div className="row">
            {messages.map((message) => {
                return <ShowMessage Message={message} key={message.id}/>
            })}
        </div>
    )
}

export default RenderMessages

