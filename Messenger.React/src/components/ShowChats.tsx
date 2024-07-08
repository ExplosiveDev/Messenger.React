import { FC, MouseEvent, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import User from "../Models/User";

interface ChatProps {
    Chat: User;
}

const ShowChats: FC<ChatProps> = ({ Chat }) => {
    const auth = useContext(AuthContext);

    const selectChat = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        auth.setSelectedChat(Chat);
    };

    return (
        <div className="col-12 mt-2 text-center">
            <button className="chat-hover btn btn-outline-secondary w-100" type="button" onClick={selectChat}>
                <h3 className="chat-name m-0">{Chat.userName}</h3>
            </button>
        </div>
    );
};

export default ShowChats;
