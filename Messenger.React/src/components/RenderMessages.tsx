import { FC, useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import Message from "../Models/Message";
import ShowMessage from "./ShowMessage";
import useIndexedDBMessenger from "../hooks/indexedDbMessenger.hook";
import { MessengerContex } from "../context/MessegerContext";
import messagesReadedPayload from "../Models/ResponsModels/messagesReadedPayload";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "../store/store";

const RenderMessages: FC = () => {
    const selectedChat = useAppSelector(state => state.selectedChat).chat!;
    const user = useAppSelector(state => state.user).user;

    const auth = useContext(AuthContext);
    const messenger = useContext(MessengerContex);
    const { openDb, db, getMessagesByChatId, GetUnReadedMessagIds, SetReadedMessages, getChat } = useIndexedDBMessenger();
    const [messages, setMessages] = useState<Message[]>([]);
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
    }, [dbOpened])

    useEffect(() => {
        const fetchMessages = async () => {
            if (!dbOpened || !db) return;
            try {
                const msgs: Message[] = await getMessagesByChatId(selectedChat.id);
                if (msgs) setMessages(msgs);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };
        fetchMessages();
    }, [dbOpened, messenger.message]);

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