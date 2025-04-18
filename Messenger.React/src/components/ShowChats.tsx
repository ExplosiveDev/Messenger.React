import { FC, useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import ShowChat from "./ShowChat";
import PrivateChat from "../Models/PrivateChat";
import GroupChat from "../Models/GroupChat";
import Chat from "../Models/Chat";
import { MessengerContex } from "../context/MessegerContext";
import useIndexedDBMessenger from "../hooks/indexedDbMessenger.hook";
import { motion } from "framer-motion"; 


interface ChatsProps {
  Chats: Chat[];
}

const ShowChats: FC<ChatsProps> = ({ Chats }) => {
  const { openDb, getChats } = useIndexedDBMessenger()
  const [dbOpened, setDbOpened] = useState(false);

  const auth = useContext(AuthContext);
  const messenger = useContext(MessengerContex);

  const [chats, setChats] = useState<Chat[]>([]);
  
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
  },[])

  useEffect (() => {
    setChats(Chats);
  },[Chats])

  useEffect ( () => {
    if(!dbOpened) return;
    const fetchChats = async () => {
      const chats = await getChats();
      setChats(chats);
    };
    fetchChats();
  },[messenger.chats])
  
  const isPrivateChat = (chat: Chat): chat is PrivateChat => {
    return (chat as PrivateChat).user1 !== undefined && (chat as PrivateChat).user2 !== undefined;
  };

  const isGroupChat = (chat: Chat): chat is GroupChat => {
    return (chat as GroupChat).groupName !== undefined;
  };            

  return (
    <div className="d-flex flex-column m-0">
    {Array.isArray(chats) && chats.length > 0 &&
      chats.map((chat, index) => {
        const delay = index * 0.05;

        if (isPrivateChat(chat)) {
          const user1 = chat.user1;
          const user2 = chat.user2;
          const chatUser = user1.id === auth.user?.id ? user2 : user1;

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
                ChatPhoto={chatUser.activeAvatar.url || "default-avatar.png"}
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
