import { ChangeEvent, FC, FormEvent, MouseEvent, useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import RenderMessages from "../components/RenderMessages";
import axios from "axios";
import ShowChats from "../components/ShowChats";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPlus } from '@fortawesome/free-solid-svg-icons';

import '../assets/styles/bootstrap.min.css';
import '../assets/styles/MainMenueStyles/MainMenue.css';
import '../assets/styles/style.css';

import { MessengerContex } from "../context/MessegerContext";
import Chat from "../Models/Chat";
import PrivateChat from "../Models/PrivateChat";
import GroupChat from "../Models/GroupChat";
import useIndexedDBMessenger from "../hooks/indexedDbMessenger.hook";
import SearchChats from "../components/SearchChats";
import ChatsCortage from "../Models/ChatsCortage";
import { createPrivateChat, getSavedChats } from "../services/chats";
import ChatMenu from "../components/ChatMenue";
import FilePicker from "../components/FilePicker";
import { getChat as getChatService } from "../services/chats";
import ProfileMenue from "../components/ProfileMenue";
import FabMenu from "../components/FabMenue";

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

interface searcheGlobalChats {
    privateChats: PrivateChat[],
    groupChats: GroupChat[]
}

const Messenger: FC = () => {
    const auth = useContext(AuthContext);
    const messenger = useContext(MessengerContex);

    const [searchChatName, setSearchChat] = useState("");
    const [message, setMessage] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [debouncedTerm, setDebouncedTerm] = useState(searchChatName);
    const [savedChats, setSavedChats] = useState<Chat[]>([]);
    const [searchedChats, setSearchedChats] = useState<Chat[]>([]);

    const [showSavedChats, setShowSavedChats] = useState(true);
    const [showSearchedChats, setShowSearchedSavedChats] = useState(false);
    const [showProfile, setShowProfile] = useState(false)
    const [isGlobalSearch, setIsGlobalSearch] = useState(false);

    const { openDb, getChats, getChatsByName, isGroupChat, isPrivateChat, getChat, addPrivateChats, addPrivateChat, addGroupChats, addChat } = useIndexedDBMessenger()

    const [DbOpened, setDbOpened] = useState(false);

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
        if (!DbOpened) return;

        getSavedChats(auth.token!).then((chats: ChatsCortage | null) => {
            if (chats) {
                addPrivateChats(chats.privateChats);
                addGroupChats(chats.groupChats);
                getChats().then((chats) => {
                    setSavedChats(chats);
                    messenger.initChats(chats);
                });
            }
        });

    }, [DbOpened])

    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchChatName.length === 0) {
                setShowSearchedSavedChats(false);
                setShowSavedChats(true);
                return;
            }
            setDebouncedTerm(searchChatName);
        }, 100); // 100 мс затримка 

        return () => {
            clearTimeout(handler);
        };
    }, [searchChatName]);

    useEffect(() => {
        const searchChats = async () => {
            try {
                const chats: Chat[] = await getChatsByName(searchChatName);
                if (chats.length > 0) {
                    console.log("getChatsByName", chats);
                    setSearchedChats(chats);
                    setIsGlobalSearch(false);
                }
                else { //Глобальний пошук всіх приватних та групових чатів за назвою                    
                    const response = await axios.get(`http://192.168.0.100:5187/Chats/GetGlobalChatsByName`, {
                        params: { name: searchChatName },
                        headers: {
                            Authorization: `Bearer ${auth.token}`
                        }
                    });
                    setIsGlobalSearch(true);
                    const data: searcheGlobalChats = response.data;
                    const chats: Chat[] = [...data.privateChats, ...data.groupChats];
                    setSearchedChats(chats);
                }
            } catch (error) {
                console.error('Search failed:', error);
            }
        };


        if (debouncedTerm) {
            searchChats();
        }
    }, [debouncedTerm]);

    useEffect(() => {
        if (!DbOpened) return;
        const processingMessage = async () => {
            if (await getChat(messenger.message?.chatId!) == null) {
                const newChat = await getChatService(auth.token!, messenger.message?.chatId!);
                await addChat(newChat);
                messenger.addNewChat(newChat);
            }
        };

        processingMessage();
    }, [messenger.message])

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchChat(e.target.value);
        if (e.target.value.length > 0) {
            if (!showSearchedChats)
                setShowSearchedSavedChats(true)
            if (showSavedChats)
                setShowSavedChats(false)
        }
        else {
            getChats().then(setSavedChats);
        }


    };

    const handleMessageChange = (e: ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);
    };

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

    const handleLeftSearchMode = async (e: MouseEvent<HTMLButtonElement>) => {

        setSearchChat("");
        if (DbOpened) {
            try {
                const chats = await getChats();
                setSavedChats(chats);
            } catch (error) {
                console.error('Failed to fetch chats:', error);
            }
        }
        if (showSearchedChats) setShowSearchedSavedChats(false);
        if (showProfile) setShowProfile(false);
        setShowSavedChats(true);
    }

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

                const response = await axios.post(
                    `http://192.168.0.100:5187/Files/Upload`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                            Authorization: `Bearer ${auth.token}`,
                        },
                    }
                );
                const filedId: string = response.data.id;
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

    const onProfileSelect = (isSelected: boolean) => {
        setShowSavedChats(false);
        setShowProfile(true);
    }

    return (
        <div className="h-100 text-color-main-menu">
            <div className="row h-100">
                <div className="col-3 sidebar py-2 ps-0 pe-0 ">
                    <div className="search-bar ps-2 pe-2 d-flex">
                        <div className="row row-cols w-100 mx-0">
                            <div className="col-2 d-flex  pe-0 ">
                                {
                                    showSavedChats && (
                                        <ChatMenu onProfileSelect={onProfileSelect} />
                                    )
                                }
                                {
                                    (showSearchedChats || showProfile) && (
                                        <button className="btn btn-secondary " type="button" id="left" aria-expanded="false" onClick={handleLeftSearchMode}>
                                            <FontAwesomeIcon icon={faArrowLeft} />
                                        </button>
                                    )
                                }
                            </div>
                            {
                                !showProfile && (
                                    <div className="col-10 d-flex justify-content-start px-0">
                                        <input type="text" className="form-control mb-1 w-100" placeholder="Search" value={searchChatName} onChange={handleSearchChange} />
                                    </div>
                                )
                            }
                            {
                                showProfile && (
                                    <div className="col-10 d-flex justify-content-center align-items-center px-0">
                                        <h4 className="m-0" >Profile </h4>
                                    </div>
                                )

                            }
                        </div>
                    </div>
                    {
                        showProfile && (
                            <ProfileMenue User={auth.user!} />
                        )
                    }
                    {
                        showSavedChats && (
                            <>
                                <ShowChats
                                    Chats={savedChats}
                                    key={"savedChats"}
                                />
                                <FabMenu/>
                            </>
                        )
                    }
                    {
                        showSearchedChats && (
                            <SearchChats
                                Chats={searchedChats}
                                isGlobalSearch={isGlobalSearch}
                                key={"searchedChats"}
                            />
                        )
                    }
                </div>

                <div className="col-9 chat ps-0 pe-0">
                    {!!auth.selectedChat && auth.selectedChat!.id != undefined && (
                        <>
                            <div className="chat-header d-flex">
                                <img className="chat-photo me-2" src={isPrivateChat(auth.selectedChat) ? (
                                    (() => {
                                        const user1 = auth.selectedChat.user1;
                                        const user2 = auth.selectedChat.user2;
                                        const chatUser = user1.id === auth.user?.id ? user2 : user1;
                                        return chatUser.activeAvatar.url;
                                    })()
                                ) : isGroupChat(auth.selectedChat) ? (
                                    "url..."
                                ) : (
                                    "url..."
                                )}
                                    alt="Chat" />
                                <div className="row ">
                                    <div className="d-flex col-12 " >
                                        <h4 className="m-0">
                                            {isPrivateChat(auth.selectedChat) ? (
                                                (() => {
                                                    const user1 = auth.selectedChat.user1;
                                                    const user2 = auth.selectedChat.user2;
                                                    const chatUser = user1.id === auth.user?.id ? user2 : user1;
                                                    return chatUser.userName;
                                                })()
                                            ) : isGroupChat(auth.selectedChat) ? (
                                                auth.selectedChat.groupName
                                            ) : (
                                                "Unknown Chat"
                                            )}
                                        </h4>
                                    </div>
                                    <div className="d-flex col-12 " >
                                        <h6 className="m-0 user-status">Online</h6>
                                    </div>
                                </div>
                            </div>
                            <div className="messages ms-5 me-5 ps-5 pe-5">
                                <RenderMessages key={auth.selectedChat.id} ChatId={auth.selectedChat.id}></RenderMessages>
                            </div>

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
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messenger;
