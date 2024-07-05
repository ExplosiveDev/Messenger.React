import Chat from "./Chat";
import User from "./User";

interface Message{
    id: string,
    content: string,
    timestamp: string,
    sender: User;
    chats: Chat[];

}

export default Message;