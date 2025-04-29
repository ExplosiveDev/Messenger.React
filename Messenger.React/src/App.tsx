import { FC, useEffect, useState } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { AuthContext } from './context/AuthContext';
import MyRoutes from './pages/MyRoutes';
import { useConnection } from './hooks/connection.hook';
import { useAppDispatch, useAppSelector } from './store/store';
import { initUserData } from './store/features/userSlice';

const App: FC = () => {
  const { user, token } = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();

  const { connection, setConnection } = useConnection();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>()

  useEffect(() => {
    window.sessionStorage.setItem("selectedChatId", "");
    dispatch(initUserData());
  }, []);

  useEffect(() => {
    setIsAuthenticated(token === '' ? false : true);
  }, [user]);

  useEffect(() => {
    const connectToChat = async () => {
      if (user) {
        try {
          const newConnection = new HubConnectionBuilder()
            .withUrl("http://192.168.0.100:5187/chat")
            .withAutomaticReconnect()
            .build();

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

  }, [isAuthenticated, user]);

  return (
    <AuthContext.Provider
      value={{
        connection: connection || null,
      }}
    >
      <MyRoutes isAuthenticated={isAuthenticated!} />
    </AuthContext.Provider >
  );
};

export default App;
