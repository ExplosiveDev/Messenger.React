import Chat from "./Chat";
import User from "./User";

interface Message{
    id: string,
    content: string,
    timestamp: string,
    receiverId: string,
    sender: User;
    receive: User;
    chats: Chat[];

}

export default Message;