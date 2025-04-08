import { ChangeEvent, FC, FormEvent, useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { MessengerContex } from "../context/MessegerContext";
import {createPrivateChat } from "../services/chats";
import FilePicker from "./FilePicker";
import useIndexedDBMessenger from "../hooks/indexedDbMessenger.hook";
import { uploadMedia } from "../services/files";

interface sendTextMessagePayload {
    content: string,
    senderId: string
    chatId: string
}

interface sendMediaMessagePayload {
    caption: string,
    fileId: string,
    senderId: string
    chatId: string
}

const MessageForm: FC = () => {

    const auth = useContext(AuthContext);
    const messenger = useContext(MessengerContex);

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
        const sendTextMessagePayload: sendTextMessagePayload = {
            content: message,
            senderId: auth.user?.id!,
            chatId: auth.selectedChat!.id,
        };

        //Якщо чата не існує, створюєм новий чат з відповідним користувачем
        if (await getChat(auth.selectedChat!.id) == null) {
            const newChat = await createPrivateChat(auth.token!, auth.selectedChat?.user1Id);
            await addPrivateChat(newChat);
            messenger.addNewChat(newChat);
            auth.setSelectedChat(newChat);
            sendTextMessagePayload.chatId = newChat.id;
        }

        auth.connection!.invoke("SendTextMessage", sendTextMessagePayload);
        setMessage("");
    };

    const handleFileSelect = (file: File) => {
        console.log('File selected:', file);
        setFile(file);
    };

    const handlePhotoSelect = (photo: File, caption?: string) => {
        // console.log('Photo selected:', photo, "Caption : ", caption);
        const uploadFile = async () => {
            if (photo) {
                const formData = new FormData();
                formData.append("file", photo);

                const filedId: string = await uploadMedia(auth.token!, formData);

                // console.log(filedId)
                const sendMediaMessagePayload: sendMediaMessagePayload = {
                    caption: caption ? caption : "",
                    fileId: filedId,
                    senderId: auth.user?.id!,
                    chatId: auth.selectedChat?.id!
                }
                // console.log(sendMediaMessagePayload);
                auth.connection!.invoke("SendMediaMessage", sendMediaMessagePayload);
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