import { FC, MouseEvent, useContext } from "react";
import Chat from "../Models/Chat";
import ShowChats from "./ShowChats";

interface ChatProps {
    Chats: Chat[];
    isGlobalSearch: boolean;
}

const SearchChats: FC<ChatProps> = ({Chats, isGlobalSearch}) => {

    return (
        <div>
            {
                isGlobalSearch && (
                    <>
                        <div className="text-center">Global search</div>
                        <ShowChats Chats={Chats} key={"SearchGlobalChats"}></ShowChats>
                    </>
                )
            }
            {
                !isGlobalSearch && (
                    <>
                        <div className="text-center">Chats</div>
                        <ShowChats Chats={Chats} key={"SearchSavedChats"}></ShowChats>
                    </>
                )
            }
        </div>

    )

};

export default SearchChats;