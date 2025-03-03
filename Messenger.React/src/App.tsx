import React, { useEffect, useState } from 'react';
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

const App: React.FC = () => {
  const { login, logout, token, user } = useAuth();
  const { messages, chats, addNewMessage, addNewChat, initChats } = useMessage();

  const { connection, setConnection, selectedChat, setSelectedChat } = useConnection();
  const { openDb, addPrivateChats, addGroupChats, addMessage } = useIndexedDBMessenger();

  const isAuthenticated = !!token;

  const [DbOpened, setDbOpened] = useState(false);

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
                  addMessage(message).then(() => { //Оптимізувати отримання повідомлення*
                    addNewMessage(message);
                  });

                }
              }

            }
          });

          // newConnection.on("ReceiveSystemMessage", (message) => {
          //   // console.log(message);

          // });
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
          messages: messages || null,
          chats: chats || null,
          addNewMessage: addNewMessage,
          addNewChat: addNewChat
        }}>
        <MyRoutes isAuthenticated={isAuthenticated} user={user!} />
      </MessengerContex.Provider>
    </AuthContext.Provider >
  );
};

export default App;
