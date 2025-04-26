import { createContext } from "react";
import { HubConnection } from "@microsoft/signalr";

interface AuthContextType {
    connection: HubConnection | null;
}

const defaultAuthContext: AuthContextType = {
    connection: null,
};

export const AuthContext = createContext(defaultAuthContext);
