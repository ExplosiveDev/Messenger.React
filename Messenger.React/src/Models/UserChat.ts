import Chat from "./Chat"
import User from "./User"

interface UserChat{
    userId :string,
    user :User,
    chatId :string,
    chat :Chat
}

export default UserChat;