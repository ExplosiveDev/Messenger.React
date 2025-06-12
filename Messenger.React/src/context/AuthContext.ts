import { createContext } from "react";
import { HubConnection } from "@microsoft/signalr";

interface ConnectionContextType {
    connection: HubConnection | null;
}

const defaultAuthContext: ConnectionContextType = {
    connection: null,
};

export const AuthContext = createContext(defaultAuthContext);
