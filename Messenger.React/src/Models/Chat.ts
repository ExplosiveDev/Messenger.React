import Message from "./Message";
import User from "./User";

interface Chat{
    id: string,
    name: string,
    messages: Message[],
    users: User[];
}

export default Chat;