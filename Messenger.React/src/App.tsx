import React, { useEffect } from 'react';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { AuthContext } from './context/AuthContext';
import MyRoutes from './pages/MyRoutes';
import { useConnection } from './hooks/connection.hook';
import { useAuth } from './hooks/auth.hook';
import { MessageContex } from './context/MessageContext';
import { useMessage } from './hooks/message.hook';

const App: React.FC = () => {
  const { login, logout, token, user } = useAuth();
  const { connection, setConnection, selectedChat, setSelectedChat } = useConnection();
  const {messages,addNewMessage} = useMessage()
  const isAuthenticated = !!token;

  useEffect(() => {
    const connectToChat = async () => {
      if (user) {
        try {
          const newConnection = new HubConnectionBuilder()
            .withUrl("https://localhost:7250/chat")
            .withAutomaticReconnect()
            .build();

          newConnection.on("ReceiveMessage", (message, status) => {
            if(status == 200)
              addNewMessage(message);

          });

          newConnection.on("ReceiveSystemMessage", (message) => {
            console.log(message);

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
  }, [isAuthenticated, user]);

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
            addNewMessage : addNewMessage,
          }}>
        <MyRoutes isAuthenticated={isAuthenticated} user={user!} />
      </MessageContex.Provider>
    </AuthContext.Provider>
  );
};

export default App;
