import { HubConnection } from '@microsoft/signalr';
import { useCallback, useEffect, useState } from 'react';

export const useMessage = () => {
    const [connection, _setConnection] = useState<HubConnection | null>(null);

    const setConnection = useCallback( (newConnection: HubConnection | null) : void => {
        _setConnection(newConnection);
    },[])

    return {connection,setConnection};
}