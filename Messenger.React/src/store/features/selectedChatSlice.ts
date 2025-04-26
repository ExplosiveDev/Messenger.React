import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Chat from '../../Models/Chat';

export interface ChatsState {
    chat: Chat | null;
}
const initialState: ChatsState = {
    chat: null
}

export const SelectedChatSlice = createSlice({
    name: "selectedChat",
    initialState,
    reducers: {
        setSelectedChat: (state, action: PayloadAction<{ chat: Chat }>) => {
            state.chat = action.payload.chat;
            window.sessionStorage.setItem("selectedChatId", action.payload.chat.id )
        },
    }
})

export default SelectedChatSlice.reducer;

export const { setSelectedChat } = SelectedChatSlice.actions