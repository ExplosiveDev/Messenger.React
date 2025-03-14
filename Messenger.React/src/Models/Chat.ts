import Message from "./Message";
import UserChat from "./UserChat";

interface Chat{
    id: string,
    messages: Message[],
    userChats: UserChat[],
    isMessagesUpdate: boolean,
    topMessage:Message,
    unReaded:number,
}

export default Chat;