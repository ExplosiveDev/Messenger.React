import Chat from '../../Models/Chat';
import GroupChat from '../../Models/GroupChat';
import { changeChatAvatar, changeChatName } from './chatSlice';
import { AppDispatch, RootState } from '../store'; 
import myFile from '../../Models/File';

function isGroupChat(chat: Chat): chat is GroupChat {
    return (chat as GroupChat).groupName !== undefined;
}

export const updateChatNameAndReturn = (
    chatId: string,
    newChatName: string
) => async (dispatch: AppDispatch, getState: () => RootState): Promise<Chat | null> => {
    dispatch(changeChatName({ chatId, newChatName }));

    const state = getState();
    const updatedChat = state.chats.chats.find(chat => chat.id === chatId);

    if (updatedChat && isGroupChat(updatedChat)) {
        return updatedChat;
    }

    return null; 
};

export const updateChatAvatarAndReturn = (
    chatId: string,
    newChatAvatar: myFile
) => async (dispatch: AppDispatch, getState: () => RootState): Promise<Chat | null> => {
    dispatch(changeChatAvatar({ chatId, newChatAvatar }));

    const state = getState();
    const updatedChat = state.chats.chats.find(chat => chat.id === chatId);

    if (updatedChat && isGroupChat(updatedChat)) {
        return updatedChat;
    }

    return null; 
};
