import { FC, useContext, useEffect, useState } from "react";
import ShowChat from "./ShowChat";
import Chat from "../Models/Chat";
import useIndexedDBMessenger from "../hooks/indexedDbMessenger.hook";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../store/store";
import { AuthContext } from "../context/AuthContext";
import { addChat, removeChat } from "../store/features/chatSlice";
import { getChatService } from "../services/chats";

interface ChatsProps {
  Chats: Chat[];
}
const ShowChats: FC<ChatsProps> = ({ Chats }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const auth = useContext(AuthContext);
  const { openDb, removeChat: removeChatDb, isGroupChat, isPrivateChat,addChat:addChatDb } = useIndexedDBMessenger()
  const [dbOpened, setDbOpened] = useState(false);

  const user = useAppSelector(state => state.user).user;
  const token = useAppSelector(state => state.user).token;
  const dispatch = useAppDispatch();


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

  }, [])

  useEffect(() => {
    setChats(Chats);
  }, [Chats])

  useEffect(() => {
    if (!auth.connection) return;
    const handleRemovedChat = async(chatId: string) => {
      if (dbOpened && chatId){
        await removeChatDb(chatId);
        dispatch(removeChat({ chatId: chatId }));
      }

    };

    auth.connection.on("ReceiveRemovedChatId", handleRemovedChat);

    return () => {
      auth.connection?.off("ReceiveRemovedChatId", handleRemovedChat);
    };
  }, [auth.connection, dbOpened]);


  useEffect(() => {
    if (!auth.connection) return;
    const handleReceiveNewChat = async (newChatId:string) => {
      if (dbOpened && newChatId) {
        const newChat = await getChatService(token, newChatId);
        await addChatDb(newChat);
        dispatch(addChat({ chat: newChat }));
      }
    };

    auth.connection.on("ReceiveNewChat", handleReceiveNewChat);

    return () => {
      auth.connection?.off("ReceiveNewChat", handleReceiveNewChat);
    };
  }, [auth.connection, dbOpened])

  return (
    <div className="d-flex flex-column m-0">
      {Array.isArray(chats) && chats.length > 0 &&
        chats.map((chat, index) => {
          const delay = index * 0.05;

          if (isPrivateChat(chat)) {
            const user1 = chat.user1;
            const user2 = chat.user2;
            const chatUser = user1.id === user?.id ? user2 : user1;

            return (
              <motion.div
                key={chat.id}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay }}
              >
                <ShowChat
                  Chat={chat}
                  ChatName={chatUser.userName}
                  ChatPhoto={chatUser.activeAvatar?.url || "default-avatar.png"}
                />
              </motion.div>
            );
          } else if (isGroupChat(chat)) {
            return (
              <motion.div
                key={chat.id}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay }}
              >
                <ShowChat
                  Chat={chat}
                  ChatName={chat.groupName}
                  ChatPhoto={chat.activeIcon?.url || "default-avatar.png"}
                />
              </motion.div>
            );
          } else {
            return null;
          }
        })}
    </div>
  );
};

export default ShowChats;
