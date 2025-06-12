import { HubConnection } from '@microsoft/signalr';
import {useState} from 'react';
export const useConnection = () => {
    const [connection, _setConnection] = useState<HubConnection | null>(null);

    const setConnection = (newConnection: HubConnection | null) : void => {
        _setConnection(newConnection);
    }

    return {connection, setConnection};
}