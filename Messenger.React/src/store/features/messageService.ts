import { createAsyncThunk } from "@reduxjs/toolkit";
import { editTextMessage } from "./messageSlice";
import { getChatById } from "./chatService";
import { changeTopMessage } from "./chatSlice";
import { RootState } from "../store";

export const editMessageAndUpdateChat = createAsyncThunk(
    'messages/editMessageAndUpdateChat',
    async ({ chatId, messageId, newContent }: { chatId: string, messageId: string, newContent: string }, { dispatch, getState }) => {
        dispatch(editTextMessage({ chatId, messageId, newContent }));
        
        const state = getState() as RootState;
        const chat = getChatById(chatId)(() => state);
        if (chat && chat.topMessage.id === messageId) {
            const newTopMessage = { ...chat.topMessage, content: newContent }
            dispatch(changeTopMessage({ chatId:chatId, newTopMessage: newTopMessage}));
        }
    }
);