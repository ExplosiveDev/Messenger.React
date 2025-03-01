import { ChangeEvent, FC, FormEvent, MouseEvent, useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import RenderMessages from "../components/RenderMessages";
import axios from "axios";
import ShowChats from "../components/ShowChats";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

import '../assets/styles/bootstrap.min.css';
import '../assets/styles/style.css';
import '../assets/styles/MainMenueStyles/MainMenue.css';

import { MessengerContex } from "../context/MessegerContext";
import Chat from "../Models/Chat";
import PrivateChat from "../Models/PrivateChat";
import GroupChat from "../Models/GroupChat";
import useIndexedDBMessenger from "../hooks/indexedDbMessenger.hook";
import SearchChats from "../components/SearchChats";

interface sendMessagePayload {
    content: string,
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
    const [debouncedTerm, setDebouncedTerm] = useState(searchChatName);
    const [savedChats, setSavedChats] = useState<Chat[]>([]);
    const [searchedChats, setSearchedChats] = useState<Chat[]>([]);

    const [showSavedChats, setShowSavedChats] = useState(true);
    const [showSearchedChats, setShowSearchedSavedChats] = useState(false);
    const [isGlobalSearch, setIsGlobalSearch] = useState(false);

    const { openDb, getChats, getChatsByName, isGroupChat, isPrivateChat, getMessagesByChatId } = useIndexedDBMessenger()

    const [DbOpened, setDbOpened] = useState(false);

    useEffect(() => {
        const initChatsDb = async () => {
            try {
                await openDb();
                setDbOpened(true);
            } catch (error) {
                console.error("Error opening IndexedDB:", error);
            }
        };
        initChatsDb();
    }, []);

    useEffect(() => {
        (async () => {
            const chats = await getChats();
            if (chats) {
                setSavedChats(chats);
            }
        })();
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

    const handleSubmitMessage = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const sendMessagePayload: sendMessagePayload = {
            content: message,
            senderId: auth.user?.id!,
            chatId: auth.selectedChat?.id!
        };
        auth.connection!.invoke("SendMessage", sendMessagePayload);
    };

    const handleLeftSearchMode = async (e: MouseEvent<HTMLButtonElement>) => {
        setShowSearchedSavedChats(false);
        setSearchChat("");
        setShowSavedChats(true);
    }

    return (
        <div className="h-100 text-color-main-menu">
            <div className="row h-100">
                <div className="col-3 sidebar py-2 ps-0 pe-0">
                    <div className="search-bar ps-2 pe-2 d-flex">
                        {
                            showSavedChats && (
                                <button className="btn btn-secondary me-2 mb-2" type="button" aria-expanded="false">
                                    <FontAwesomeIcon icon={faEllipsisV} />
                                </button>
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
                                dbOpened ={DbOpened}
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

                            <form onSubmit={handleSubmitMessage}>
                                <div className="input-container mb-3 ms-5 me-5 ps-5 pe-5">
                                    <input type="text" className="form-control" placeholder="Message" onChange={handleMessageChange} />
                                    <button className="btn btn-primary ml-2" type="submit">Send</button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>


        </div>


    );
};

export default Messenger;
