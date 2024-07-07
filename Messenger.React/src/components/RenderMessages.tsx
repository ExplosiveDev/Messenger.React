import { ChangeEvent, FC, FormEvent, useContext, useEffect, useState } from "react";

import { AuthContext } from "../context/AuthContext";
import Message from "../Models/Message";
import ShowMessage from "./ShowMessage";

interface ChatIdProps {
    ChatId: string;
}

const RenderMessages: FC<ChatIdProps> = ({ChatId}) => {

    const auth = useContext(AuthContext);
    const [messages, setMessages] = useState<Message[]>([])

    useEffect(() => {
        const preloadedMessages: Message[] = [
            { id: "1", content: "Hello!", timestamp: new Date().toISOString(), sender: { id: auth.user!.id, userName: "Me", phone: "", passwordHash: "", roles: [], messages: [], chats: [] }, chats: [] },
            { id: "2", content: "Hi! How are you?", timestamp: new Date().toISOString(), sender: { id: "friendId", userName: "Friend", phone: "", passwordHash: "", roles: [], messages: [], chats: [] }, chats: [] },
            { id: "3", content: "I'm doing well, thanks!", timestamp: new Date().toISOString(), sender: { id: auth.user!.id, userName: "Me", phone: "", passwordHash: "", roles: [], messages: [], chats: [] }, chats: [] },
            { id: "4", content: "What about you?", timestamp: new Date().toISOString(), sender: { id: auth.user!.id, userName: "Me", phone: "", passwordHash: "", roles: [], messages: [], chats: [] }, chats: [] },
            { id: "5", content: "I'm good too, just busy with work.", timestamp: new Date().toISOString(), sender: { id: "friendId", userName: "Friend", phone: "", passwordHash: "", roles: [], messages: [], chats: [] }, chats: [] },
            { id: "6", content: "Yeah, work has been hectic lately.", timestamp: new Date().toISOString(), sender: { id: auth.user!.id, userName: "Me", phone: "", passwordHash: "", roles: [], messages: [], chats: [] }, chats: [] },
            { id: "7", content: "Do you have any plans for the weekend? ", timestamp: new Date().toISOString(), sender: { id: "friendId", userName: "Friend", phone: "", passwordHash: "", roles: [], messages: [], chats: [] }, chats: [] },
            { id: "8", content: "Not really, just planning to relax.", timestamp: new Date().toISOString(), sender: { id: auth.user!.id, userName: "Me", phone: "", passwordHash: "", roles: [], messages: [], chats: [] }, chats: [] },
            { id: "9", content: "That sounds nice. I might go hiking.", timestamp: new Date().toISOString(), sender: { id: "friendId", userName: "Friend", phone: "", passwordHash: "", roles: [], messages: [], chats: [] }, chats: [] },
            { id: "10", content: "Enjoy your hike!", timestamp: new Date().toISOString(), sender: { id: auth.user!.id, userName: "Me", phone: "", passwordHash: "", roles: [], messages: [], chats: [] }, chats: [] }
        ];

        setMessages(preloadedMessages);
    }, [ChatId]);

    return (
        <div className="row">
            {messages.map((message) => {
                return <ShowMessage Message={message} key={message.id}/>
            })}
        </div>
    )
}

export default RenderMessages

