import { configureStore } from '@reduxjs/toolkit'
import { ChatSlice } from './features/chatSlice';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { SelectedChatSlice } from './features/selectedChatSlice';
import { UserSlice } from './features/userSlice';
import { MessageSlice } from './features/messageSlice';
import { SearchedChatsSlice } from './features/searchedChatsSlice';
import { ActionMessageSlice } from './features/actionMessageSlice';


export const store = configureStore({
    reducer: {
        chats: ChatSlice.reducer,
        searchedChats: SearchedChatsSlice.reducer,
        selectedChat: SelectedChatSlice.reducer,
        user: UserSlice.reducer,
        messages: MessageSlice.reducer,
        actionMessage: ActionMessageSlice.reducer
    }
})

export const useAppDispatch: () => typeof store.dispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<ReturnType<typeof store.getState>> = useSelector;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;