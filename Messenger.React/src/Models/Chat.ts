import MediaMessage from "./MediaMessage";
import Message from "./Message";
import TextMessage from "./TextMessage";
import UserChat from "./UserChat";

interface Chat{
    id: string,
    messages: Message[],
    userChats: UserChat[],
    isMessagesUpdate: boolean,
    topMessage:TextMessage | MediaMessage,
    unReaded:number,
}

export default Chat;