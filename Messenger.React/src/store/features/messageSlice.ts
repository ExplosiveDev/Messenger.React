import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Message from '../../Models/Message';

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
        }

    }
})

export default MessageSlice.reducer;

export const {addMessage,setMessages} = MessageSlice.actions;
