import { ChangeEvent, FC, FormEvent, useContext, useEffect, useState } from "react";

import { AuthContext } from "../context/AuthContext";
import Message from "../Models/Message";
import ShowMessage from "./ShowMessage";
import { MessageContex } from "../context/MessageContext";
import IndexedDbMessageEntity from "../Models/IndexedDbMessageEntity";
import useIndexedDB from "../hooks/indexedDb.hook";

interface ChatProps {
    ChatId: string;
}

const RenderMessages: FC<ChatProps> = ({ChatId}) => {

    const auth = useContext(AuthContext);
    const newMessages = useContext(MessageContex);
    const { openDb, getData, addDataEntity, addDataRange, addNewMessageIntoData, db, } = useIndexedDB("Messages")
    const [dbOpened, setDbOpened] = useState(false);

    const [messages, setMessages] = useState<Message[]>([])

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
    useEffect(()  => {
        if (!dbOpened || !auth.token) return;
        getData(ChatId!).then((object: IndexedDbMessageEntity) => {
            if(object)
                setMessages(object.messages);
        });
        console.log("22")
    }, [newMessages.messages, dbOpened]);

    useEffect(() => {
        
    }, [messages]);


    return (
        <div className="row">
            {messages.map((message) => {
                return <ShowMessage Message={message} key={message.id}/>
            })}
        </div>
    )
}

export default RenderMessages

