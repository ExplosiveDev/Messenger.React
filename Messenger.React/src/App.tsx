import React, { useEffect } from 'react';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { AuthContext } from './context/AuthContext';
import { IndexedDBProvider } from './context/IndexedDbContext'; // Вказати правильний шлях до вашого контексту
import MyRoutes from './pages/MyRoutes';
import { useMessage } from './hooks/message.hook';
import { useAuth } from './hooks/auth.hook';

const App: React.FC = () => {
  const { login, logout, token, user } = useAuth();
  const { connection, setConnection, selectedChat, setSelectedChat } = useMessage();
  const isAuthenticated = !!token;

  useEffect(() => {
    const connectToChat = async () => {
      if (user) {
        try {
          const newConnection = new HubConnectionBuilder()
            .withUrl("https://localhost:7250/chat")
            .withAutomaticReconnect()
            .build();

          newConnection.on("ReceiveMessage", (message) => {
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
      <IndexedDBProvider>
        <MyRoutes isAuthenticated={isAuthenticated} user={user!} />
      </IndexedDBProvider>
    </AuthContext.Provider>
  );
};

export default App;
