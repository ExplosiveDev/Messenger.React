import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Message from '../../Models/Message';
import { isTextMessage } from './chatSlice';


export interface MessagesState {
    messages: Message[];
}
const initialState: MessagesState = {
    messages: [],
}

export const MessageSlice = createSlice({
    name: "messages",
    initialState,
    reducers: {
        addMessage: (state, action: PayloadAction<{ message: Message }>) => {
            state.messages.push(action.payload.message);
        },
        removeMessage: (state, action: PayloadAction<{ messageId: string }>) => {
            const { messageId } = action.payload;
            state.messages = state.messages.filter(message => message.id !== messageId);
        },        
        setMessages(state, action: PayloadAction<{ messages: Message[] }>) {
            state.messages = action.payload.messages;
        },
        editTextMessage(state, action: PayloadAction<{ messageId: string, newContent: string }>) {
            const { messageId, newContent } = action.payload;
            const messageIndex = state.messages.findIndex(message => message.id === messageId);
            if (messageIndex !== -1) {
                const message = state.messages[messageIndex];
                if (isTextMessage(message)) {
                    message.content = newContent;
                }
            }
        }
    }
})

export default MessageSlice.reducer;

export const {addMessage, removeMessage, setMessages, editTextMessage} = MessageSlice.actions;
