import Chat from "./Chat";
import myFile from "./File";
import User from "./User";

interface GroupChat extends Chat{
    groupName:string,
    adminId:string,
    admin:User,
    activeIcon: myFile
}

export default GroupChat;