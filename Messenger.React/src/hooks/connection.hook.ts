import { HubConnection } from '@microsoft/signalr';
import { useCallback, useEffect, useState } from 'react';
import User from '../Models/User';
import Chat from '../Models/Chat';

export const useConnection = () => {
    const [connection, _setConnection] = useState<HubConnection | null>(null);
    const [selectedChat, _setSelectedChat] = useState<Chat | null>();

    const setConnection = useCallback( (newConnection: HubConnection | null) : void => {
        _setConnection(newConnection);
    },[])
    const setSelectedChat = useCallback( (chat : Chat) => {
        if(chat != null){
            _setSelectedChat(chat);
        }
    },[])

    return {connection,setConnection,selectedChat,setSelectedChat};
}