import Message from "./Message";
import UserChat from "./UserChat";

interface Chat{
    id: string,
    messages: Message[],
    userChats: UserChat[],
    isMessagesUpdate: boolean,
}

export default Chat;