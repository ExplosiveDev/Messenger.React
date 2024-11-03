import { ChangeEvent, FC, FormEvent, useContext, useEffect, useState } from "react";

import { AuthContext } from "../context/AuthContext";
import Message from "../Models/Message";
import ShowMessage from "./ShowMessage";
import { MessageContex } from "../context/MessageContext";

interface ChatProps {
    ChatId: string;
    Messages: Message[];
}

const RenderMessages: FC<ChatProps> = ({ChatId,Messages}) => {

    const auth = useContext(AuthContext);

    const [messages, setMessages] = useState<Message[]>([])
    useEffect(() => {
        console.log(Messages)
    },[])
    useEffect(() => {

        setMessages(Messages);
    }, [Messages]);


    return (
        <div className="row">
            {messages.map((message) => {
                return <ShowMessage Message={message} key={message.id}/>
            })}
        </div>
    )
}

export default RenderMessages

