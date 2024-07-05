import Chat from "./Chat";
import Message from "./Message";

interface User{
    id:string,
    userName:string,
    phone:string,
    passwordHash:string,
    roles: string[],
    messages: Message[],
    chats: Chat[],
}

export default User;