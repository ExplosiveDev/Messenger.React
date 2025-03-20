import Chat from "./Chat";
import User from "./User";

interface PrivateChat extends Chat{
    user1Id: string,
    user1:User,
    user2Id: string,
    user2:User
}

export default PrivateChat;