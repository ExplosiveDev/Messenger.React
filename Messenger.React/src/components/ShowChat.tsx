import { FC, MouseEvent, useContext, useEffect, useRef, useState } from "react";
import User from "../Models/User";
import { AuthContext } from "../context/AuthContext";
import Chat from "../Models/Chat";
import Message from "../Models/Message";
import { getMessagesByChatId } from "../services/messages";
import useIndexedDBMessenger from "../hooks/indexedDbMessenger.hook";

interface ChatProps {
    Chat: Chat;
    ChatName:string
}

const ShowChat: FC<ChatProps> = ({ Chat, ChatName }) => {
    const auth = useContext(AuthContext);
    const { openDb, db, ChatMessagesUpdate, addMessages } = useIndexedDBMessenger()
    const [dbOpened, setDbOpened] = useState(false);
    const [Messages, setMessages] = useState<Message[]>([]);


    const selectChat = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        const fetchMessages = async () => {
            try {
                const messages: Message[] = await getMessagesByChatId(auth.token!, Chat.id);
                // console.log(messages);
                setMessages(messages);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        const initDb = async () => {
            try {
                await openDb(); 
                setDbOpened(true);
            } catch (error) {
                console.error("Error opening IndexedDB:", error);
            }
        }; 
        // console.log(Chat.isMessagesUpdate);
        if(!Chat.isMessagesUpdate){ //Повідомлення не взяті з БД
            fetchMessages();
            initDb();
        }
        else{ //Повідомлення взяті з БД 
            auth.setSelectedChat(Chat);
        }
    };
    
    useEffect(() => {
        if(dbOpened){
            Chat.isMessagesUpdate = true;
            addMessages(Messages).then(() => {     
                ChatMessagesUpdate(Chat)        
                auth.setSelectedChat(Chat);
            })
        }

    }, [Messages]); 



    return (
        <div className="col-12 my-1 ">
            <button
                className="btn w-100 chat-hover  "
                type="button"
                onClick={selectChat}
                
            >
                <h3 className="chat-name m-0 text-start">{ChatName}</h3>
            </button>

        </div>
    )

};

export default ShowChat;