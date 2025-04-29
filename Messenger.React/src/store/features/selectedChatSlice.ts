import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Chat from '../../Models/Chat';

export interface ChatsState {
    chatId: string | '';
}
const initialState: ChatsState = {
    chatId: ''
}

export const SelectedChatSlice = createSlice({
    name: "selectedChat",
    initialState,
    reducers: {
        setSelectedChat: (state, action: PayloadAction<{ chat: Chat }>) => {
            state.chatId = action.payload.chat.id;
            window.sessionStorage.setItem("selectedChatId", action.payload.chat.id )
        },
    }
})

export default SelectedChatSlice.reducer;

export const { setSelectedChat } = SelectedChatSlice.actions