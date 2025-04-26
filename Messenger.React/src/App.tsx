import { FC, useEffect, useState } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { AuthContext } from './context/AuthContext';
import MyRoutes from './pages/MyRoutes';
import { useConnection } from './hooks/connection.hook';
import useIndexedDBMessenger from './hooks/indexedDbMessenger.hook';
import messagesReadedPayload from './Models/ResponsModels/messagesReadedPayload';
import Message from './Models/Message';
import { useAppDispatch, useAppSelector } from './store/store';
import { initUserData } from './store/features/userSlice';
import { useMessage } from './hooks/message.hook';
import { MessengerContex } from './context/MessegerContext';


const App: FC = () => {
  const { message,addNewMessage} = useMessage();

  const {user,token} = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();


  const { connection, setConnection } = useConnection();
  const { openDb, addMessage } = useIndexedDBMessenger();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>()
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
    dispatch(initUserData());
  }, []);

  useEffect(() => {
    setIsAuthenticated(token === '' ? false : true);
  }, [user]);

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
                  if (selectedChatId == message.chatId && user.id != message.senderId) {
                    message.isReaded = true;

                    const messagesReadedPayload: messagesReadedPayload = {
                      chatId: selectedChatId,
                      userId: user.id,
                      messegeIds: [message.id]
                    };

                    newConnection.invoke("MessagesReaded", messagesReadedPayload);
                  }


                  const processingMessage = async () => {
                    await addMessage(message); // add in indexedDb   
                    addNewMessage(message); // add in Context
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
        connection: connection || null,
      }}
    >
      <MessengerContex.Provider
        value={{
          message: message || null,
          addNewMessage: addNewMessage,
        }}>
        <MyRoutes isAuthenticated={isAuthenticated!} />
      </MessengerContex.Provider>
    </AuthContext.Provider >
  );
};

export default App;
