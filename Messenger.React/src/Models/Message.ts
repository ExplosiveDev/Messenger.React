import Chat from "./Chat";
import User from "./User";

interface Message{
    id: string,
    content: string ,
    timestamp:string,
    senderId: string,
    sender: User,
    chatId: string,
    chat:Chat,
    isReaded:boolean,

}

export default Message;