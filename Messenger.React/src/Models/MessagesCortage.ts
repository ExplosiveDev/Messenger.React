import MediaMessage from "./MediaMessage";
import TextMessage from "./TextMessage";

interface MessagesCortage{
    textMessages:TextMessage[],
    mediaMessages:MediaMessage[]
}

export default MessagesCortage;