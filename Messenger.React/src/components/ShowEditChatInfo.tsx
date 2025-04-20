import { FC } from "react";
import Chat from "../Models/Chat";

interface ShowEditChatInfoProps{
    chat: Chat;
    onCloseEditChat?:() => void; 
}

const ShowEditChatInfo:FC<ShowEditChatInfoProps> = ( {chat, onCloseEditChat}) => {
    return(
        <></>
    )
}

export default ShowEditChatInfo;