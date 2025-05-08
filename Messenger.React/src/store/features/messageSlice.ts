import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import Message from '../../Models/Message';
import { isTextMessage } from './chatSlice';
import { getChatById } from './chatService';
import { RootState } from '../store';


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
        setMessages(state, action: PayloadAction<{ messages: Message[] }>) {
            state.messages = action.payload.messages;
        },
        editTextMessage(state, action: PayloadAction<{ chatId: string, messageId: string, newContent: string }>) {
            const { chatId, messageId, newContent } = action.payload;
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

export const {addMessage, setMessages, editTextMessage} = MessageSlice.actions;
