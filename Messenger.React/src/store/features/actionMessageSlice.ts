import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Message from '../../Models/Message';

export interface ActionMessageState {
    actions: Record<string, string>;
    actionType: string,
    actionMessage: Message | null
}
const initialState: ActionMessageState = {
    actions: {
        Edit: "Edit",
        Copy: "Copy",
        Delete: "Delete",
    },
    actionType: '',
    actionMessage: null,
}

export const ActionMessageSlice = createSlice({
    name: "actionMessage",
    initialState,
    reducers: {
        addAction:(state, action: PayloadAction<{actionType: string, message: Message }>) => {
            const { actionType, message } = action.payload;
            state.actionType = actionType;
            state.actionMessage = message;
            console.log(actionType);
        },
        closeAction:(state) => {
            state.actionMessage = null,
            state.actionType = ''
        }

    }
})

export default ActionMessageSlice.reducer;

export const { addAction, closeAction } = ActionMessageSlice.actions;
