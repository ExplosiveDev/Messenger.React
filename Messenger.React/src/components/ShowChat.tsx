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
    ChatName: string;
    ChatPhoto: string;
}

const ShowChat: FC<ChatProps> = ({ Chat, ChatName, ChatPhoto }) => {
    const auth = useContext(AuthContext);
    const messenger = useContext(MessengerContex);
    const { openDb, ChatMessagesUpdate, addMessages, GetCountOfUnReadedMessages, getChat, isTextMessage, isMediaMessage, addChat } = useIndexedDBMessenger();

    const [dbOpened, setDbOpened] = useState(false);
    const [Messages, setMessages] = useState<Message[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(Chat.unReaded);
    const [chatTopMessage, setChatTopMessage] = useState<Message | null>(Chat.topMessage || null);

    useEffect(() => {
        const initDb = async () => {
            try {
                await openDb();
                setDbOpened(true);
            } catch (error) {
                console.error("Error opening IndexedDB:", error);
            }
        };
        initDb();
    }, []);

    const selectChat = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const fetchMessages = async () => {
            if (await getChat(Chat.id) == null) {
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

        if (!Chat.isMessagesUpdate) fetchMessages();
        else auth.setSelectedChat(Chat);

        if (unreadCount > 0) setUnreadCount(0);
    };

    useEffect(() => {
        if (dbOpened) {
            Chat.isMessagesUpdate = true;
            addMessages(Messages).then(() => {
                ChatMessagesUpdate(Chat);
                auth.setSelectedChat(Chat);
            });
        }
    }, [Messages]);

    useEffect(() => {
        if (!dbOpened) return;

        const getCount = async () => {
            const unReaded: number = await GetCountOfUnReadedMessages(Chat.id);
            setUnreadCount(unReaded);
        };
        getCount();

        if (Chat.id === messenger.message?.chatId) {
            const getTopMessage = async () => {
                const chat = await getChat(Chat.id);
                if (chat?.topMessage) {
                    setChatTopMessage(isTextMessage(chat.topMessage) ? chat.topMessage as TextMessage : chat.topMessage as MediaMessage);
                }
            };
            getTopMessage();
        }
    }, [messenger.message]);

    return (
        <div className="col-12 my-1 px-2">
            <button className="btn w-100 chat-hover position-relative d-flex align-items-center" type="button" onClick={selectChat}>
                {/* Картинка чату зліва */}
                <img className="chat-photo me-2" src={ChatPhoto} alt="Chat" />
    
                <div className="d-flex flex-column text-start">
                    <h3 className="chat-name m-0 text-light">{ChatName}</h3>
                    {chatTopMessage && isTextMessage(chatTopMessage) && chatTopMessage.content && (
                        <h4 className="chat-name m-0 text-secondary">{chatTopMessage.content}</h4>
                    )}
                    {chatTopMessage && isMediaMessage(chatTopMessage) && chatTopMessage.content.length > 0 && (
                        <div className="d-flex flex-row align-items-center">
                            <img className="top-message-img me-1" src={chatTopMessage.content[0]?.url || ""} alt="Media" />
                            <h4 className="chat-name m-0 text-secondary">
                                {chatTopMessage.caption !== "" ? chatTopMessage.caption : chatTopMessage.content[0]?.fileName || "Файл"}
                            </h4>
                        </div>
                    )}
                </div>
    
                {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {unreadCount}
                    </span>
                )}
            </button>
            
        </div>
    );
};

export default ShowChat;
