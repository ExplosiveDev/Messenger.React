import { HubConnection } from '@microsoft/signalr';
import { useCallback, useEffect, useState } from 'react';
import User from '../Models/User';

export const useMessage = () => {
    const [connection, _setConnection] = useState<HubConnection | null>(null);
    const [selectedChat, _setSelectedChat] = useState<User | null>();

    const setConnection = useCallback( (newConnection: HubConnection | null) : void => {
        _setConnection(newConnection);
    },[])
    const setSelectedChat = useCallback( (user : User) => {
        if(user != null){
            _setSelectedChat(user);
        }
    },[])

    return {connection,setConnection,selectedChat,setSelectedChat};
}