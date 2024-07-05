import { FC, useEffect, useMemo, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr'
import { AuthContext } from './context/AuthContext'
import MyRoutes from './pages/MyRoutes'
import { useAuth } from './hooks/auth.hook'
import Message from './Models/Message'
import { useMessage } from './hooks/message.hook'


const App: FC = () => {
    const { login, logout, token, user } = useAuth();
    const {connection, setConnection} = useMessage();
    const isAuthenticated = !!token;

    useEffect(() => {
        const connectToChat = async () => {
            if (user) {
                try {
                    const newConnection = new HubConnectionBuilder()
                        .withUrl("https://localhost:7250/chat")
                        .withAutomaticReconnect()
                        .build();

                    newConnection.on("ReceiveMessage", (message: Message) => {
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
        <>
            <AuthContext.Provider value={{
                token: token || "",
                user: user || null,
                connection : connection || null,
                login,
                logout,
                isAuthenticated
            }}>
                <MyRoutes isAuthenticated={isAuthenticated} user={user!} ></MyRoutes>
            </AuthContext.Provider>
        </>
    )
}

export default App;
