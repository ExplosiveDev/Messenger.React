import {FC, FormEvent, useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { createPrivateChatService } from "../../services/chats";
import FilePicker from "./FilePicker";
import useIndexedDBMessenger from "../../hooks/indexedDbMessenger.hook";
import { UploadMediaService } from "../../services/files";
import SendTextMessageRequest from "../../Models/RequestModels/SendTextMessageRequest";
import TextMessage from "../../Models/TextMessage";
import SendMediaMessageRequest from "../../Models/RequestModels/SendMediaMessageRequest";
import MediaMessage from "../../Models/MediaMessage";
import { SendTextMessageService, SendMediaMessageService, EditTextMessageService } from "../../services/messages";
import { useAppDispatch, useAppSelector } from "../../store/store";
import PrivateChat from "../../Models/PrivateChat";
import { setSelectedChat } from "../../store/features/selectedChatSlice";
import { addChat } from "../../store/features/chatSlice";
import { getChatById, getSearchedChatById } from "../../store/features/chatService";
import { faCheck, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ActionMessageForm from "./ActionMessageForm";
import { closeAction } from "../../store/features/actionMessageSlice";
import EditTextMessageRequest from "../../Models/RequestModels/EditTextMessageRequest";

const MessageForm: FC = () => {
    const selectedChatId = useAppSelector(state => state.selectedChat).chatId;
    const token = useAppSelector(state => state.user).token;
    const selectedChat = useAppSelector(state => getChatById(selectedChatId)(() => state))
        ? useAppSelector(state => getChatById(selectedChatId)(() => state))
        : useAppSelector(state => getSearchedChatById(selectedChatId)(() => state));

    const dispatch = useAppDispatch();

    const { actionMessage, actionType, actions } = useAppSelector(state => state.actionMessage);

    const auth = useContext(AuthContext);

    const { openDb, getChat, addChat: addChatDb, isTextMessage, editTextMessageDb } = useIndexedDBMessenger()
    const [DbOpened, setDbOpened] = useState(false);

    const [message, setMessage] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const isActionWithMessage = actionMessage && actionType !== "";

    useEffect(() => {
        const initChatsDb = async () => {
            try {
                await openDb();
                console.log("Messenger:openDb")
                setDbOpened(true);
            } catch (error) {
                console.error("Error opening IndexedDB:", error);
            }
        };
        initChatsDb();
    }, []);

    useEffect(() => {
        if (actionMessage && isTextMessage(actionMessage)) {
            setMessage((actionMessage as TextMessage).content);
        }
        else {
            setMessage('');
        }
    }, [actionMessage]);

    const handleActionMessage = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(actionType === actions.Edit){
            if((actionMessage as TextMessage).content === message) return;
            if(actionMessage?.id){
                const editTextMessageRequest:EditTextMessageRequest = {
                    textMessageId:actionMessage?.id,
                    newTextMessageContent: message
                }
                const newContent:string | null = await EditTextMessageService(token, editTextMessageRequest);
                if(newContent){
                    if(auth.connection){
                        const data = {
                            messageId: actionMessage.id,
                            chatId: actionMessage.chatId,
                            newMessageContent: newContent.toString()
                        }
                        auth.connection.invoke("EditMessage", data);
                    }
                }
            }
        }
        dispatch(closeAction());
    }

    const createPrivateChat = async (token: string, userId: string): Promise<string> => {
        const newChat = await createPrivateChatService(token, userId);
        await addChatDb(newChat);
        dispatch(addChat({ chat: newChat }));
        dispatch(setSelectedChat({ chat: newChat }));
        return newChat.id
    }

    const handleSubmitMessage = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (message == "") return;
        const sendTextMessageRequest: SendTextMessageRequest = {
            content: message,
            chatId: selectedChat!.id,
        };

        if (await getChat(selectedChat!.id) == null) {
            const newChatId = await createPrivateChat(token, (selectedChat as PrivateChat).user1Id);
            sendTextMessageRequest.chatId = newChatId;
        }

        const textMessage: TextMessage | null = await SendTextMessageService(token, sendTextMessageRequest);
        if (textMessage) {
            auth.connection!.invoke("SendTextMessage", JSON.parse(JSON.stringify(textMessage)));
        }
        setMessage("");
    };

    const handlePhotoSelect = async (photo: File, caption?: string) => {
        if (photo) {
            const sendMediaMessageRequest: SendMediaMessageRequest = {
                fileId: "",
                caption: caption ? caption : "",
                chatId: selectedChat!.id,
            };

            if (await getChat(selectedChat!.id) == null) {
                const newChatId = await createPrivateChat(token, (selectedChat as PrivateChat).user1Id);
                sendMediaMessageRequest.chatId = newChatId;
            }

            const formData = new FormData();
            formData.append("file", photo);
            const filedId: string = await UploadMediaService(token, formData);
            sendMediaMessageRequest.fileId = filedId;
            const mediaMessage: MediaMessage | null = await SendMediaMessageService(token, sendMediaMessageRequest);
            if (mediaMessage) {
                auth.connection!.invoke("SendMediaMessage", mediaMessage);
            }
        }
    };

    const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
        if(isActionWithMessage){
            await handleActionMessage(e);
        }
        else{
            await handleSubmitMessage(e)
        }
    };

    return (
        <>
            <form onSubmit={handleSendMessage} className="d-flex flex-column mx-5 px-5 mb-2">

                <ActionMessageForm />

                <div className="d-flex align-items-center gap-2">
                    <FilePicker
                        onFileSelect={(file: File) => setFile(file)}
                        onPhotoSelect={handlePhotoSelect}
                    />

                    <input
                        type="text"
                        className="text-input flex-grow-1"
                        placeholder="Message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />

                    <button className="btn btn-primary" type="submit">
                        <FontAwesomeIcon color="white" icon={isActionWithMessage ? faCheck : faPaperPlane} />
                    </button>
                </div>
            </form>

        </>
    )
}

export default MessageForm;