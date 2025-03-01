import Chat from "./Chat";
import User from "./User";

interface GroupChat extends Chat{
    groupName:string,
    adminId:string,
    admin:User
}

export default GroupChat;