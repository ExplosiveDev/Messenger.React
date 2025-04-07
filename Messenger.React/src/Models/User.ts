import Chat from "./Chat";
import myFile from "./File";
import Message from "./Message";

interface User{
    id:string,
    userName:string,
    phone:string,
    passwordHash:string,
    roles: string[],
    messages: Message[],
    chats: Chat[],
    activeAvatar: myFile
}

export default User;