import { HubConnection } from '@microsoft/signalr';
import { useCallback, useEffect, useState } from 'react';
import User from '../Models/User';
import Chat from '../Models/Chat';

export const useConnection = () => {
    const [connection, _setConnection] = useState<HubConnection | null>(null);
    const [selectedChat, _setSelectedChat] = useState<Chat | null>();

    const setConnection = (newConnection: HubConnection | null) : void => {
        _setConnection(newConnection);
    }
    const setSelectedChat = (chat : Chat) => {
        if(chat != null){
            _setSelectedChat(chat);
            window.sessionStorage.setItem("selectedChatId", chat.id);
        }
    }

    return {connection,setConnection,selectedChat,setSelectedChat};
}