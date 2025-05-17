import { FC, MouseEvent, useEffect, useState } from "react";
import Chat from "../../Models/Chat";
import Message from "../../Models/Message";
import { GetMessagesByChatIdService } from "../../services/messages";
import useIndexedDBMessenger from "../../hooks/indexedDbMessenger.hook";
import MediaMessage from "../../Models/MediaMessage";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { setSelectedChat } from "../../store/features/selectedChatSlice";
import { changeCountOfUnreadedMessages, changeIsMessagesUpdate } from "../../store/features/chatSlice";
import { setMessages } from "../../store/features/messageSlice";

interface ChatProps {
    Chat: Chat;
    ChatName: string;
    ChatPhoto: string;
}

const ShowChat: FC<ChatProps> = ({ Chat, ChatName, ChatPhoto }) => {
    const dispatch = useAppDispatch()
    const token = useAppSelector(state => state.user).token;

    const { openDb, ChatMessagesUpdate, addMessages, getMessagesByChatId: getMessagesByChatIdDB, isTextMessage, isMediaMessage, isChatExist } = useIndexedDBMessenger();

    const [dbOpened, setDbOpened] = useState(false);

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


    const fetchMessages = async () => {
        try {
            if (await isChatExist(Chat.id)) {
                const messages = await GetMessagesByChatIdService(token, Chat.id);
                await addMessages([...messages.textMessages, ...messages.mediaMessages as MediaMessage[]]);

                const msgs: Message[] = await getMessagesByChatIdDB(Chat.id);
                dispatch(setMessages({ messages: msgs }));
                
                ChatMessagesUpdate({ ...Chat, isMessagesUpdate: true });
                dispatch(changeIsMessagesUpdate({ chatId: Chat.id, newIsMessagesUpdate: true }));
            }
        }
        catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const selectChat = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        dispatch(setSelectedChat({ chat: Chat }));

        if (!Chat.isMessagesUpdate) {
            fetchMessages()
        }
        else {
            const msgs: Message[] = await getMessagesByChatIdDB(Chat.id);
            dispatch(setMessages({ messages: msgs }));
        }

        if (Chat.unReaded > 0) {
            dispatch(changeCountOfUnreadedMessages({ chatId: Chat.id, count: 0 }))
        }
    };


    return (
        <div className="col-12 my-1 px-2">
            <button className="btn w-100 chat-hover position-relative d-flex align-items-center" type="button" onClick={selectChat}>
                <img className="chat-photo me-2" src={ChatPhoto} alt="Chat" />

                <div className="d-flex flex-column text-start">
                    <h3 className="chat-name m-0 text-light">{ChatName}</h3>
                    {Chat.topMessage && isTextMessage(Chat.topMessage) && Chat.topMessage.content && (
                        <h4 className="chat-name m-0 text-secondary">{Chat.topMessage.content}</h4>
                    )}
                    {Chat.topMessage && isMediaMessage(Chat.topMessage) && Chat.topMessage.content.length > 0 && (
                        <div className="d-flex flex-row align-items-center">
                            <img className="top-message-img me-1" src={Chat.topMessage.content[0]?.url || ""} alt="Media" />
                            <h4 className="chat-name m-0 text-secondary">
                                {Chat.topMessage.caption !== "" ? Chat.topMessage.caption : Chat.topMessage.content[0]?.fileName || "Файл"}
                            </h4>
                        </div>
                    )}
                </div>

                {Chat.unReaded > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {Chat.unReaded}
                    </span>
                )}
            </button>

        </div>
    );
};

export default ShowChat;
