import React, { useContext, useEffect, useState } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { AuthContext } from './context/AuthContext';
import MyRoutes from './pages/MyRoutes';
import { useConnection } from './hooks/connection.hook';
import { useAuth } from './hooks/auth.hook';
import { MessengerContex } from './context/MessegerContext';
import { useMessage } from './hooks/message.hook';
import useIndexedDBMessenger from './hooks/indexedDbMessenger.hook';
import messagesReadedPayload from './Models/messagesReadedPayload';
import Message from './Models/Message';
import Chat from './Models/Chat';


const App: React.FC = () => {
  const { getUserId, getToken, login, logout, token, user, ChangeAvatar } = useAuth();
  const { message, chats, addNewMessage, addNewChat, initChats } = useMessage();

  const { connection, setConnection, selectedChat, setSelectedChat } = useConnection();
  const { openDb, addMessage, getChat, addChat } = useIndexedDBMessenger();

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
    setSelectedChat({} as Chat);
    
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


                  const processingMessage = async () => {
                      await addMessage(message); // add in indexedDb   
                      addNewMessage(message); // add in Cotext
                  };

                  processingMessage();


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
        ChangeAvatar
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
