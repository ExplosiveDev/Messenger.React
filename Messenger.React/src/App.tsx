import React, { useEffect, useState } from 'react';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { AuthContext } from './context/AuthContext';
import MyRoutes from './pages/MyRoutes';
import { useConnection } from './hooks/connection.hook';
import { useAuth } from './hooks/auth.hook';
import { MessageContex } from './context/MessageContext';
import { useMessage } from './hooks/message.hook';
import Message from './Models/Message';
import useIndexedDB from './hooks/indexedDb.hook';
import User from './Models/User';

const App: React.FC = () => {
  const { login, logout, token, user } = useAuth();
  const { connection, setConnection, selectedChat, setSelectedChat } = useConnection();
  const { messages, chats, addNewMessage, addNewChat, initChats } = useMessage()
  const isAuthenticated = !!token;

  const { openDb, getData, addDataEntity, addDataRange, getAllMessages, getAllSavedChats, addNewMessageIntoData, db, } = useIndexedDB("Messages")

  const [dbOpened, setDbOpened] = useState(false); // Стан для контролю, чи відкрито базу даних

  useEffect(() => {
    const initDb = async () => {
      try {
        await openDb();
        setDbOpened(true);
        console.log("IndexedDB opened");
      } catch (error) {
        console.error("Error opening IndexedDB:", error);
      }
    };

    initDb();

  }, []);

  useEffect(() => {
    if (dbOpened) {
      getAllSavedChats()
        .then((chats: User[]) => {
          if (chats)
            initChats(chats);
        });
    }
  }, [dbOpened])

  useEffect(() => {
    const connectToChat = async () => {
      if (user && dbOpened) {
        try {
          const newConnection = new HubConnectionBuilder()
            .withUrl("https://localhost:7250/chat")
            .withAutomaticReconnect()
            .build();

          newConnection.on("ReceiveMessage", (message: Message, status: number) => {
            if (status == 200) {
              console.log(message);
              if (dbOpened) {
                if (message.receiverId == user.id)
                  addNewMessageIntoData(message, message.sender.id);
                else
                  addNewMessageIntoData(message, message.receiverId);
              }
              addNewMessage(message);
              getAllSavedChats()
                .then((chats: User[]) => {      
                  if(chats.length == 0){
                    if (dbOpened) {
                      getAllSavedChats()
                        .then((chats: User[]) => {
                          if (chats)
                            initChats(chats);
                            console.log(chats);
                        });
                    }
                  }
                  chats.forEach(element => {
                    if ((element.id != message.receiverId && message.receiverId != user.id) || (element.id != message.sender.id && message.sender.id != user.id)){
                      console.log(chats);
                      if (dbOpened) {
                        getAllSavedChats()
                          .then((chats: User[]) => {
                            if (chats)
                              initChats(chats);
                              console.log(chats);
                          });
                      }
                    }
                  });


                });

            }
          });

          newConnection.on("ReceiveSystemMessage", (message) => {
            // console.log(message);

          });

          await newConnection.start();
          await newConnection.invoke("JoinChat", {
            User: user,
            chatRoom: "FirstChat"
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
  }, [isAuthenticated, user, dbOpened]);

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
      <MessageContex.Provider
        value={{
          messages: messages || null,
          chats: chats || null,
          addNewMessage: addNewMessage,
          addNewChat: addNewChat
        }}>
        <MyRoutes isAuthenticated={isAuthenticated} user={user!} />
      </MessageContex.Provider>
    </AuthContext.Provider >
  );
};

export default App;
