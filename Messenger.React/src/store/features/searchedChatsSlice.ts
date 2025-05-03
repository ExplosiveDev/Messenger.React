import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Chat from '../../Models/Chat';


export interface SearchedChatsState {
    searchedChats: Chat[];
}
const initialState: SearchedChatsState = {
    searchedChats: [],
}


export const SearchedChatsSlice = createSlice({
    name: "searchedChats",
    initialState,
    reducers: {
        addSearchedChat: (state, action: PayloadAction<{ chat: Chat }>) => {
            state.searchedChats.push(action.payload.chat);
        },
        setSearchedChats(state, action: PayloadAction<{ chats: Chat[] }>) {
            state.searchedChats = action.payload.chats;
        },
    }
})

export default SearchedChatsSlice.reducer;

export const { 
    addSearchedChat, setSearchedChats
    } = SearchedChatsSlice.actions;
