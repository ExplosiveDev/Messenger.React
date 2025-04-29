import { ChangeEvent, FC, FormEvent, useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import {createPrivateChat } from "../services/chats";
import FilePicker from "./FilePicker";
import useIndexedDBMessenger from "../hooks/indexedDbMessenger.hook";
import { uploadMedia } from "../services/files";
import SendTextMessageRequest from "../Models/RequestModels/SendTextMessageRequest";
import TextMessage from "../Models/TextMessage";
import SendMediaMessageRequest from "../Models/RequestModels/SendMediaMessageRequest";
import MediaMessage from "../Models/MediaMessage";
import {SendTextMessage,SendMediaMessage } from "../services/messages";
import { useAppDispatch, useAppSelector } from "../store/store";
import PrivateChat from "../Models/PrivateChat";
import { setSelectedChat } from "../store/features/selectedChatSlice";
import { addChat } from "../store/features/chatSlice";
import { getChatById } from "../store/features/chatService";


const MessageForm: FC = () => {
    const selectedChatId = useAppSelector(state => state.selectedChat).chatId;
    const dispatch = useAppDispatch();
    const selectedChat = useAppSelector(state => getChatById(selectedChatId!)(() => state));   
    const token = useAppSelector(state => state.user).token;

    const auth = useContext(AuthContext);
    
    const { openDb, getChat, addPrivateChat } = useIndexedDBMessenger()
    const [DbOpened, setDbOpened] = useState(false);

    const [message, setMessage] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const handleMessageChange = (e: ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);
    };

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

    const handleSubmitMessage = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (message == "") return;
        const sendTextMessageRequest: SendTextMessageRequest = {
            content: message,
            chatId: selectedChat!.id,
        };

        //Якщо чата не існує, створюєм новий чат з відповідним користувачем
        if (await getChat(selectedChat!.id) == null) {
            const newChat = await createPrivateChat(token, (selectedChat as PrivateChat).user1Id);
            await addPrivateChat(newChat);
            dispatch(addChat({chat:newChat}));
            dispatch(setSelectedChat({chat:newChat}));
            sendTextMessageRequest.chatId = newChat.id;
        }


        const textMessage:TextMessage | null = await SendTextMessage(token, sendTextMessageRequest);
        if (textMessage) {
            auth.connection!.invoke("SendTextMessage", JSON.parse(JSON.stringify(textMessage)));
        }
        setMessage("");
    };

    const handleFileSelect = (file: File) => {
        console.log('File selected:', file);
        setFile(file);
    };

    const handlePhotoSelect = (photo: File, caption?: string) => {
        const uploadFile = async () => {
            if (photo) {
                const sendMediaMessageRequest: SendMediaMessageRequest = {
                    fileId: "",
                    caption: caption ? caption : "",
                    chatId: selectedChat!.id,
                };       

                if (await getChat(selectedChat!.id) == null) {
                    const newChat = await createPrivateChat(token, (selectedChat as PrivateChat).user1Id);
                    await addPrivateChat(newChat);
                    dispatch(addChat({chat:newChat}));
                    dispatch(setSelectedChat({chat:newChat}));
                    sendMediaMessageRequest.chatId = newChat.id;
                }

                const formData = new FormData();
                formData.append("file", photo);
                const filedId: string = await uploadMedia(token, formData);
                sendMediaMessageRequest.fileId = filedId;
                const mediaMessage:MediaMessage | null = await SendMediaMessage(token, sendMediaMessageRequest);
                if(mediaMessage){
                    auth.connection!.invoke("SendMediaMessage", mediaMessage);
                }
            }
        }
        uploadFile()
    };
    return (
        <>
            <form onSubmit={handleSubmitMessage} className="d-flex align-items-center gap-2 mb-3 mx-5 px-5">
                {/* Кнопка вибору файлу з dropup меню */}
                <FilePicker
                    onFileSelect={handleFileSelect}
                    onPhotoSelect={handlePhotoSelect}
                />
                {/* Поле вводу повідомлення */}
                <input
                    type="text"
                    className="form-control flex-grow-1"
                    placeholder="Message"
                    value={message}
                    onChange={handleMessageChange}
                />

                <button className="btn btn-primary" type="submit">Send</button>
            </form>
        </>
    )
}

export default MessageForm;