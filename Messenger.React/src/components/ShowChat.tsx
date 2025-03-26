import { FC, MouseEvent, useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import Chat from "../Models/Chat";
import Message from "../Models/Message";
import { getMessagesByChatId } from "../services/messages";
import useIndexedDBMessenger from "../hooks/indexedDbMessenger.hook";
import { MessengerContex } from "../context/MessegerContext";
import TextMessage from "../Models/TextMessage";
import MediaMessage from "../Models/MediaMessage";

interface ChatProps {
    Chat: Chat;
    ChatName:string
}

const ShowChat: FC<ChatProps> = ({ Chat, ChatName }) => {
    const auth = useContext(AuthContext);
    const messenger = useContext(MessengerContex);
    const { openDb, ChatMessagesUpdate, addMessages, GetCountOfUnReadedMessages, getChat,isTextMessage, isMediaMessage } = useIndexedDBMessenger()
    const [dbOpened, setDbOpened] = useState(false);
    const [Messages, setMessages] = useState<Message[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [chatTopMessage, setChatTopMessage] = useState<Message>(Chat.topMessage);

    useEffect(() => {
        setUnreadCount(Chat.unReaded);
        const initDb = async () => {
            try {
                await openDb(); 
                setDbOpened(true);
            } catch (error) {
                console.error("Error opening IndexedDB:", error);
            }
        }; 
        initDb();

    },[])

    const selectChat = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        const fetchMessages = async () => {
            if(await getChat(Chat.id) == null){
                auth.setSelectedChat(Chat);
                return;
            } 
            try {
                const messages = await getMessagesByChatId(auth.token!, Chat.id);
                setMessages([...messages.textMessages, ...messages.mediaMessages as MediaMessage[]]);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        //Повідомлення взяті з БД
        if(!Chat.isMessagesUpdate) fetchMessages();

        //Повідомлення взяті з indexedDb
        else auth.setSelectedChat(Chat);

        //Повідомлення прочитані
        if(unreadCount > 0) setUnreadCount(0);

    };
    
    useEffect(() => {
        if(dbOpened){
            Chat.isMessagesUpdate = true;
            addMessages(Messages).then(() => {     
                ChatMessagesUpdate(Chat);    
                auth.setSelectedChat(Chat);
            })
        }
    }, [Messages]); 

    useEffect(() => {
        if(!dbOpened) return;
        const getCount = async () => {
            const unReaded:number = await GetCountOfUnReadedMessages(Chat.id)
            setUnreadCount(unReaded);
        }
        getCount();

        if(Chat.id == messenger.message?.chatId){
            const getTopMessage = async () => {
                getChat(Chat.id).then((chat) => {
                    setChatTopMessage(isTextMessage(chat?.topMessage!) ? chat?.topMessage as TextMessage : chat?.topMessage as MediaMessage);
                });

            }
            getTopMessage();
        }
    },[messenger.message])

    useEffect(() => {

    }, [unreadCount])


    return (
<div className="col-12 my-1 px-2">
    <button
        className="btn w-100 chat-hover position-relative"
        type="button"
        onClick={selectChat}
    >
        <div className="row">
            <div className="col-12">
                <h3 className="chat-name m-0 text-start text-light ">{ChatName}</h3>
            </div>
            <div className="col-12">
                {chatTopMessage ? isTextMessage(chatTopMessage) && (
                    <h4 className="chat-name m-0 text-start text-secondary">{chatTopMessage.content}</h4>
                ) : null}

                {chatTopMessage ? isMediaMessage(chatTopMessage) && (
                    <div className="d-flex flex-row">
                        <img className="top-message-img me-1" src={chatTopMessage.content[0].url}></img>
                        <h4 className="chat-name m-0 text-start text-secondary">{chatTopMessage.caption != "" ? chatTopMessage.caption : chatTopMessage.content[0].fileName }</h4>
                    </div>
                ) : null}
            </div>

        </div>
        {unreadCount > 0 && (
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {unreadCount}
            </span>
        )}
    </button>
</div>
    )

};

export default ShowChat;