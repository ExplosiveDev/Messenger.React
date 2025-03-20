import React, { useContext, useEffect, useState } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { AuthContext } from './context/AuthContext';
import MyRoutes from './pages/MyRoutes';
import { useConnection } from './hooks/connection.hook';
import { useAuth } from './hooks/auth.hook';
import { MessengerContex } from './context/MessegerContext';
import { useMessage } from './hooks/message.hook';
import { getSavedChats } from './services/chats';
import useIndexedDBMessenger from './hooks/indexedDbMessenger.hook';
import Message from './Models/Message';
import Chat from "./Models/Chat";
import { tr } from 'date-fns/locale';
import messagesReadedPayload from './Models/messagesReadedPayload';

const App: React.FC = () => {
  const { getUserId, login, logout, token, user } = useAuth();
  const { message, chats, addNewMessage, addNewChat, initChats } = useMessage();

  const { connection, setConnection, selectedChat, setSelectedChat } = useConnection();
  const { openDb, addPrivateChats, addGroupChats, addMessage } = useIndexedDBMessenger();

  const isAuthenticated = !!token;

  const [DbOpened, setDbOpened] = useState(false);

  const auth = useContext(AuthContext);


  useEffect(() => {
    const initChatsDb = async () => {
      try {
        await openDb();
        setDbOpened(true);
      } catch (error) {
        console.error("Error opening IndexedDB:", error);
      }
    };
    initChatsDb();
    setSelectedChat(null);
  }, []);


  useEffect(() => {
    const connectToChat = async () => {
      if (user && DbOpened) {
        try {
          const newConnection = new HubConnectionBuilder()
            .withUrl("http://192.168.0.100:5187/chat")
            .withAutomaticReconnect()
            .build();

          newConnection.on("ReceiveMessage", (message: Message, status: number) => {
            if (status == 200) {
              if (DbOpened) {
                if (message) {
                  const selectedChatId = window.sessionStorage.getItem("selectedChatId");
                  const userId = getUserId();
                      //якщо юзер вже перегляжає чат  && якщо це той юзер якому надіслали 
                      // - тоді ми надсилаємо до серверу що це повідомлення було прочитане 
                  if (selectedChatId == message.chatId && userId != message.senderId) {
                    message.isReaded = true;

                    const messagesReadedPayload: messagesReadedPayload = {
                      chatId: selectedChatId,
                      userId: userId,
                      messegeIds: [message.id]
                    };

                    newConnection.invoke("MessagesReaded", messagesReadedPayload);
                  }

                  addMessage(message).then(() => {                    
                    addNewMessage(message);
                  });

                }
              }

            }
          });


          newConnection.on("ReceiveReadedMessageIds", (ids: string[]) => {
            console.log("ids");
          });


          await newConnection.start();
          await newConnection.invoke("JoinChat", {
            User: user,
            chatRoom: "Chats"
          });
          setConnection(newConnection);
        } catch (error) {
          console.error(error);
        }
      }
    };

    if (isAuthenticated) {
      connectToChat();
    }

    return () => {
      if (connection) {
        connection.stop();
        setConnection(null);
      }
    };
  }, [isAuthenticated, user, DbOpened]);

  return (
    <AuthContext.Provider
      value={{
        selectedChat: selectedChat || null,
        token: token || "",
        user: user || null,
        connection: connection || null,
        login,
        logout,
        setSelectedChat,
        isAuthenticated,
      }}
    >
      <MessengerContex.Provider
        value={{
          message: message || null,
          chats: chats || null,
          addNewMessage: addNewMessage,
          addNewChat: addNewChat,
          initChats:initChats,
        }}>
        <MyRoutes isAuthenticated={isAuthenticated} user={user!} />
      </MessengerContex.Provider>
    </AuthContext.Provider >
  );
};

export default App;
