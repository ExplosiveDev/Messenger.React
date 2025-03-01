import Chat from "./Chat";
import User from "./User";

interface Message{
    id: string,
    content: string ,
    timestamp:string | Date,
    senderId: string,
    sender: User,
    chatId: string,
    chat:Chat,

}

export default Message;