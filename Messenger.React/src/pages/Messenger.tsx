import { ChangeEvent, FC, FormEvent, MouseEvent, useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import RenderMessages from "../components/RenderMessages";
import axios from "axios";
import ShowChats from "../components/ShowChats";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPaperclip } from '@fortawesome/free-solid-svg-icons';

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
import { getSavedChats } from "../services/chats";
import Message from "../Models/Message";
import ChatMenu from "../components/ChatMenue";

interface sendMessagePayload {
    content: string,
    photoId:string,
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
    const [isGlobalSearch, setIsGlobalSearch] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const { openDb, getChats, getChatsByName, isGroupChat, isPrivateChat, getChat, addPrivateChats, addPrivateChat, addGroupChats } = useIndexedDBMessenger()

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


    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchChat(e.target.value);
        if (e.target.value.length > 0) {
            if (!showSearchedChats)
                setShowSearchedSavedChats(true)
            if (showSavedChats)
                setShowSavedChats(false)
        }


    };

    const handleMessageChange = (e: ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            console.log(e.target.files[0]);
        }

    };

    const handleSubmitMessage = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const sendMessagePayload: sendMessagePayload = {
            content: message,
            photoId:"",
            senderId: auth.user?.id!,
            chatId: auth.selectedChat!.id,
        };

        // if (file) {
        //     const formData = new FormData();
        //     formData.append("file", file);
    
        //     const response = await axios.post(
        //         `http://192.168.0.100:5187/Files/Upload`,
        //         formData,
        //         {
        //             headers: {
        //                 "Content-Type": "multipart/form-data",
        //                 Authorization: `Bearer ${auth.token}`,
        //             },
        //         }
        //     );
        //     const data = response.data;
        //     sendMessagePayload.photoId = data.fileId;
        //     console.log(data);
        // }

        //Якщо чата не існує, створюєм новий чат з відповідним користувачем
        if (await getChat(auth.selectedChat!.id) == null) {
            const response = await axios.post(
                `http://192.168.0.100:5187/Chats/CreatePrivateChat`,
                null,
                {
                    params: {
                        user2Id: auth.selectedChat?.user1Id
                    },
                    headers: {
                        Authorization: `Bearer ${auth.token}`,
                    }
                }
            );
            const newChat = response.data;
            await addPrivateChat(newChat).then(() => {
                messenger.addNewChat(newChat);
                auth.setSelectedChat(newChat);
                sendMessagePayload.chatId = newChat.id;
            });
        }


        auth.connection!.invoke("SendMessage", sendMessagePayload);
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
        setShowSearchedSavedChats(false);
        setShowSavedChats(true);



    }


    return (
        <div className="h-100 text-color-main-menu">
            <div className="row h-100">
                <div className="col-3 sidebar py-2 ps-0 pe-0">
                    <div className="search-bar ps-2 pe-2 d-flex">
                        {
                            showSavedChats && (
                                <ChatMenu />
                            )
                        }
                        {
                            showSearchedChats && (
                                <button className="btn btn-secondary me-2  mb-2" type="button" id="left" aria-expanded="false" onClick={handleLeftSearchMode}>
                                    <FontAwesomeIcon icon={faArrowLeft} />
                                </button>
                            )
                        }
                        <input type="text" className="form-control mb-1 " placeholder="Search" value={searchChatName} onChange={handleSearchChange} />

                    </div>
                    {
                        showSavedChats && (
                            <ShowChats
                                Chats={savedChats}
                                key={"savedChats"}
                            />
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
                    {!!auth.selectedChat && (
                        <>

                            <div className="chat-header">
                                {isPrivateChat(auth.selectedChat) ? (
                                    (() => {
                                        const user1Name = auth.selectedChat.user1?.userName || "Unknown User";
                                        const user2Name = auth.selectedChat.user2?.userName || "Unknown User";
                                        const chatName = user1Name === auth.user?.userName ? user2Name : user1Name;
                                        return chatName;
                                    })()
                                ) : isGroupChat(auth.selectedChat) ? (
                                    auth.selectedChat.groupName
                                ) : (
                                    "Unknown Chat"
                                )}
                            </div>
                            <div className="messages ms-5 me-5 ps-5 pe-5">
                                <RenderMessages key={auth.selectedChat.id} ChatId={auth.selectedChat.id}></RenderMessages>
                            </div>

                            <form onSubmit={handleSubmitMessage} className="d-flex align-items-center gap-2 mb-3 mx-5 px-5">
                                {/* Кнопка вибору файлу */}
                                <div className="position-relative">
                                    <input
                                        type="file"
                                        id="fileInput"
                                        className="d-none"
                                        onChange={handleFileChange}
                                    />
                                    <label htmlFor="fileInput" className="btn p-2">
                                        <FontAwesomeIcon icon={faPaperclip} className="text-secondary" size="lg" />
                                    </label>
                                </div>

                                {/* Поле вводу повідомлення */}
                                <input
                                    type="text"
                                    className="form-control flex-grow-1"
                                    placeholder="Message"
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
