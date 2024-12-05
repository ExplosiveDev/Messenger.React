
import Message from "./Message";
import User from "./User";

interface IndexedDbMessageEntity{
    id: string,
    user: User,
    messages: Message[];

}

export default IndexedDbMessageEntity;