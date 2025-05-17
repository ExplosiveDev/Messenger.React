import { FC, useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import ShowMessage from "./ShowMessage";
import useIndexedDBMessenger from "../../hooks/indexedDbMessenger.hook";
import messagesReadedPayload from "../../Models/ResponsModels/messagesReadedPayload";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { getChatById, getSearchedChatById } from "../../store/features/chatService";
import { editMessageAndUpdateChat } from "../../store/features/messageService";
import { editTextMessage, removeMessage } from "../../store/features/messageSlice";
import { changeTopMessage } from "../../store/features/chatSlice";

const RenderMessages: FC = () => {
    const selectedChatId = useAppSelector(state => state.selectedChat).chatId;
     const selectedChat = useAppSelector(state => getChatById(selectedChatId)(() => state)) 
     ? useAppSelector(state => getChatById(selectedChatId)(() => state)) 
     : useAppSelector(state => getSearchedChatById(selectedChatId)(() => state)); 
    const messages = useAppSelector(state => state.messages).messages;
    const user = useAppSelector(state => state.user).user;
    const dispatch = useAppDispatch();



    const auth = useContext(AuthContext);
    const { openDb, editTextMessageDb, isChatTopMessage, getTextMessage,getMessage, getChat, GetUnReadedMessagIds, SetLastMessageToChat, SetReadedMessages,removeMessageDb,getChatTopMessage  } = useIndexedDBMessenger();
    const [dbOpened, setDbOpened] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);


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

    useEffect(() => {
        if (!auth.connection) return;

        async function handleReceiveEditedMessage(messageId:string, chatId:string, newMessageContent:string) {
            if (dbOpened) {
                dispatch(editTextMessage({messageId: messageId, newContent: newMessageContent}));
                await editTextMessageDb(messageId, newMessageContent);
                if(await isChatTopMessage(chatId, messageId)){
                    const message = await getTextMessage(messageId);
                    dispatch(changeTopMessage({ chatId:chatId, newTopMessage: message}));
                    await SetLastMessageToChat(chatId,message);
                }
            }
        }

        auth.connection.on("ReceiveEditedMessage", handleReceiveEditedMessage);

        return () => {
            auth.connection?.off("ReceiveEditedMessage", handleReceiveEditedMessage);
        };
    }, [auth.connection, dbOpened])

    useEffect(() => {
        if (!auth.connection) return;

        async function handleReceiveRemovedMessage(messageId:string) {
            if (dbOpened) {
                const message = await getMessage(messageId);
                dispatch(removeMessage({messageId: messageId}));
                if(await isChatTopMessage(message.chatId, messageId)){
                    await removeMessageDb(messageId);
                    const newTopMessage = await getChatTopMessage(message.chatId)
                    console.log(newTopMessage);
                    dispatch(changeTopMessage({ chatId:message.chatId, newTopMessage: newTopMessage}));
                    await SetLastMessageToChat(message.chatId, newTopMessage);
                }
                await removeMessageDb(messageId);
            }
        }

        auth.connection.on("ReceiveRemovedMessage", handleReceiveRemovedMessage);

        return () => {
            auth.connection?.off("ReceiveRemovedMessage", handleReceiveRemovedMessage);
        };
    }, [auth.connection, dbOpened])

    useEffect(() => {
        async function markMessagesAsRead() {
            if (dbOpened) {
                if (selectedChat == null || await getChat(selectedChat.id) == null) return;

                const unreadIds = await GetUnReadedMessagIds(selectedChat!.id);

                if (unreadIds.length > 0) {
                    const messagesReadedPayload: messagesReadedPayload = {
                        chatId: selectedChat.id,
                        userId: user?.id!,
                        messegeIds: unreadIds
                    };

                    await auth.connection!.invoke("MessagesReaded", messagesReadedPayload);

                    await SetReadedMessages(unreadIds)
                }
            }
        }
        markMessagesAsRead();


    }, [auth.connection, dbOpened])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const scroll = () => {
            requestAnimationFrame(() => {
                scrollToBottom();
            });
        };
        scroll();
    }, [messages]);
    
    return (
        <div className="messages ms-5 me-5 ps-5 pe-5">
            <div className="row">
                <AnimatePresence initial={false}>
                    {messages.length > 0 && messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ x: message.senderId === user?.id ? 50 : -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: message.senderId === user?.id ? 50 : -50, opacity: 0 }}
                            transition={{ duration: 0.1, ease: "easeOut" }}
                            layout
                        >
                            <ShowMessage Message={message} />
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};

export default RenderMessages;

