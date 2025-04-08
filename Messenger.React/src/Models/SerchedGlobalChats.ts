import GroupChat from "./GroupChat";
import PrivateChat from "./PrivateChat";

interface searchedGlobalChats {
    privateChats: PrivateChat[],
    groupChats: GroupChat[]
}

export default searchedGlobalChats;