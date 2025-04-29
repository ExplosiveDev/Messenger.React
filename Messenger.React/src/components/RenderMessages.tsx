import { FC, useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import ShowMessage from "./ShowMessage";
import useIndexedDBMessenger from "../hooks/indexedDbMessenger.hook";
import messagesReadedPayload from "../Models/ResponsModels/messagesReadedPayload";
import { motion, AnimatePresence } from "framer-motion";
import {  useAppSelector } from "../store/store";
import { getChatById } from "../store/features/chatService";

const RenderMessages: FC = () => {
    const selectedChatId = useAppSelector(state => state.selectedChat).chatId;
    const selectedChat = useAppSelector(state => getChatById(selectedChatId!)(() => state));
    const messages = useAppSelector(state => state.messages).messages;
    const user = useAppSelector(state => state.user).user;

    const auth = useContext(AuthContext);
    const { openDb, GetUnReadedMessagIds, SetReadedMessages, getChat } = useIndexedDBMessenger();
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
        scrollToBottom();
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