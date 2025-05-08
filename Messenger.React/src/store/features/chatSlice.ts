import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Chat from '../../Models/Chat';
import GroupChat from '../../Models/GroupChat';
import myFile from '../../Models/File';
import Message from '../../Models/Message';
import TextMessage from '../../Models/TextMessage';
import MediaMessage from '../../Models/MediaMessage';
import User from '../../Models/User';
import UserChat from '../../Models/UserChat';

export interface ChatsState {
    chats: Chat[];
}
const initialState: ChatsState = {
    chats: [],
}
function isGroupChat(chat: Chat): chat is GroupChat {
    return (chat as GroupChat).groupName !== undefined;
}

export function isTextMessage(message: Message): message is TextMessage {
    return (message as TextMessage).content !== undefined && (message as MediaMessage).mediaType === undefined;
}

function isMediaMessage(message: Message): message is MediaMessage {
  return (message as MediaMessage).mediaType !== undefined && (message as MediaMessage).caption !== undefined;
}

export const ChatSlice = createSlice({
    name: "chats",
    initialState,
    reducers: {
        addChat: (state, action: PayloadAction<{ chat: Chat }>) => {
            state.chats.push(action.payload.chat);
        },
        removeChat: (state, action: PayloadAction<{ chatId: string }>) => {
            state.chats = state.chats?.filter(m => m.id !== action.payload.chatId);
        },
        addChats(state, action: PayloadAction<{ chats: Chat[] }>) {
            state.chats = action.payload.chats;
        },
        updateChat: (state, action: PayloadAction<{chat: Chat}>) => {
            const index = state.chats.findIndex(c => c.id === action.payload.chat.id);
            if (index !== -1) {
                state.chats[index] = action.payload.chat;
            }
        },
        changeChatName: (state, action: PayloadAction<{ chatId: string, newChatName: string }>) => {
            const { chatId, newChatName } = action.payload;
            const chatIndex = state.chats.findIndex(chat => chat.id === chatId);
        
            if (chatIndex !== -1) {
                const chat = state.chats[chatIndex];
                if (isGroupChat(chat)) {
                    chat.groupName = newChatName;
                }
            }
        },
        changeChatAvatar:(state, action: PayloadAction<{chatId: string, newChatAvatar: myFile }>) => {
            const { chatId, newChatAvatar } = action.payload;
            const chatIndex = state.chats.findIndex(chat => chat.id === chatId);
                    
            if (chatIndex !== -1) {
                const chat = state.chats[chatIndex];
                if (isGroupChat(chat)) {
                    chat.activeIcon = newChatAvatar;
                }
            }
        },
        changeTopMessage:(state, action: PayloadAction<{chatId: string, newTopMessage: Message }>) => {
            const { chatId, newTopMessage } = action.payload;
            const chatIndex = state.chats.findIndex(chat => chat.id === chatId);
            if (chatIndex !== -1) {
                const chat = state.chats[chatIndex];
                if(isTextMessage(newTopMessage)) chat.topMessage = newTopMessage;
                if(isMediaMessage(newTopMessage)) chat.topMessage = newTopMessage;
            }
        },
        changeIsMessagesUpdate:(state, action: PayloadAction<{chatId: string, newIsMessagesUpdate: boolean }>) => {
            const { chatId, newIsMessagesUpdate } = action.payload;
            const chatIndex = state.chats.findIndex(chat => chat.id === chatId);
            if (chatIndex !== -1) {
                const chat = state.chats[chatIndex];
                chat.isMessagesUpdate = newIsMessagesUpdate;
            }
        },
        changeCountOfUnreadedMessages:(state, action: PayloadAction<{chatId: string, count: number }>) => {
            const { chatId, count } = action.payload;
            const chatIndex = state.chats.findIndex(chat => chat.id === chatId);
            if (chatIndex !== -1) {
                const chat = state.chats[chatIndex];
                chat.unReaded = count;
            }
        },
        removeMember:(state, action: PayloadAction<{chatId: string, memberId: string }>) => {
            const { chatId, memberId } = action.payload;
            const chatIndex = state.chats.findIndex(chat => chat.id === chatId);
            if (chatIndex !== -1) {
                const chat = state.chats[chatIndex];
                if(isGroupChat(chat)){
                    chat.userChats = chat.userChats.filter(m => m.userId !== memberId);
                }
            }
        },
        addMembers:(state, action: PayloadAction<{chatId: string, newMembers: User[] }>) => {
            const { chatId, newMembers } = action.payload;
            const chatIndex = state.chats.findIndex(chat => chat.id === chatId);
            if (chatIndex !== -1) {
                const chat = state.chats[chatIndex];
                if(isGroupChat(chat)){
                    newMembers.forEach((newUser) => {
                        const newUserChat:UserChat = {
                            chatId: chatId,
                            chat:{} as Chat,
                            userId:newUser.id,
                            user:newUser
                        };
                        chat.userChats.push(newUserChat);
                    });
                }
            }
        }
    }
})

export default ChatSlice.reducer;

export const { 
    addChat, removeChat, addChats, updateChat, addMembers,removeMember, 
    changeChatName, changeChatAvatar, changeTopMessage, changeIsMessagesUpdate, changeCountOfUnreadedMessages 
    } = ChatSlice.actions;
