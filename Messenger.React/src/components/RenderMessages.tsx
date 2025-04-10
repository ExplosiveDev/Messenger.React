import { FC, useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import Message from "../Models/Message";
import ShowMessage from "./ShowMessage";
import useIndexedDBMessenger from "../hooks/indexedDbMessenger.hook";
import { MessengerContex } from "../context/MessegerContext";
import messagesReadedPayload from "../Models/ResponsModels/messagesReadedPayload";
import { motion, AnimatePresence } from "framer-motion";


interface ChatProps {
    ChatId: string;
}


const RenderMessages: FC<ChatProps> = ({ ChatId }) => {
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

    }, [auth.selectedChat]);

    useEffect(() => {

        async function markMessagesAsRead() {
            if (dbOpened) {
                if (auth.selectedChat == null || await getChat(auth.selectedChat.id) == null) return;

                const unreadIds = await GetUnReadedMessagIds(auth.selectedChat!.id);

                if (unreadIds.length > 0) {
                    const messagesReadedPayload: messagesReadedPayload = {
                        chatId: auth.selectedChat.id,
                        userId: auth.user?.id!,
                        messegeIds: unreadIds

                    };

                    await auth.connection!.invoke("MessagesReaded", messagesReadedPayload);

                    await SetReadedMessages(unreadIds)
                }
            }
        }

        markMessagesAsRead();
    }, [dbOpened, auth.selectedChat])

    useEffect(() => {
        const fetchMessages = async () => {
            if (!dbOpened || !db) return;
            try {
                const msgs: Message[] = await getMessagesByChatId(ChatId);
                if (msgs) setMessages(msgs);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };
        fetchMessages();
    }, [dbOpened, ChatId, messenger.message]);

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
                            initial={{ x: message.senderId === auth.user?.id ? 50 : -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: message.senderId === auth.user?.id ? 50 : -50, opacity: 0 }}
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