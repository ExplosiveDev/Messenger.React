import { ChangeEvent, FC, MouseEvent, useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import RenderMessages from "../components/RenderMessages";
import ShowChats from "../components/ShowChats";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { MessengerContex } from "../context/MessegerContext";
import Chat from "../Models/Chat";
import useIndexedDBMessenger from "../hooks/indexedDbMessenger.hook";
import SearchChats from "../components/SearchChats";
import ChatsCortage from "../Models/ResponsModels/ChatsCortage";
import { getSavedChats, globalChatSearchByName } from "../services/chats";
import ChatMenu from "../components/ChatMenue";
import { getChat as getChatService } from "../services/chats";
import ProfileMenue from "../components/ProfileMenue";
import FabMenu from "../components/FabMenue";
import searchedGlobalChats from "../Models/ResponsModels/SerchedGlobalChats";
import MessageForm from "../components/MessageForm";
import { motion, AnimatePresence } from "framer-motion";

import '../assets/styles/bootstrap.min.css';
import '../assets/styles/MainMenueStyles/MainMenue.css';
import '../assets/styles/style.css';
import ChatHeader from "../components/ChatHeader";
import ShowChatInfo from "../components/ShowChatInfo";

const Messenger: FC = () => {
    const auth = useContext(AuthContext);
    const messenger = useContext(MessengerContex);

    const [searchChatName, setSearchChat] = useState("");
    const [debouncedTerm, setDebouncedTerm] = useState(searchChatName);
    const [savedChats, setSavedChats] = useState<Chat[]>([]);
    const [searchedChats, setSearchedChats] = useState<Chat[]>([]);

    const [showSavedChats, setShowSavedChats] = useState(true);
    const [showSearchedChats, setShowSearchedSavedChats] = useState(false);
    const [showProfile, setShowProfile] = useState(false)
    const [isGlobalSearch, setIsGlobalSearch] = useState(false);
    const [showChatInfo, setShowChatInfo] = useState(false);


    const { openDb, getChats, getChatsByName, getChat, addPrivateChats, addGroupChats, addChat } = useIndexedDBMessenger()

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

                    setIsGlobalSearch(true);
                    const data: searchedGlobalChats = await globalChatSearchByName(auth.token!, searchChatName);
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
                                    <div className="col-10 d-flex  align-items-center px-0">
                                        <h4 className="m-0 fw-bold" >Profile </h4>
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
                                <FabMenu />
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

                <div className={`${showChatInfo ? "col-6" : "col-9"} chat ps-0 pe-0`}>
                    {!!auth.selectedChat && auth.selectedChat!.id != undefined && (
                        <>
                            <ChatHeader selectedChat={auth.selectedChat} user={auth.user!} onOpenChatInfo={() => setShowChatInfo(true)} />

                            <RenderMessages key={auth.selectedChat.id} ChatId={auth.selectedChat.id} />

                            <MessageForm />
                        </>
                    )}
                </div>
                <AnimatePresence mode="wait">
                    {showChatInfo && !!auth.selectedChat && auth.selectedChat!.id !== undefined && (
                         <motion.div
                         key="chat-info"
                         className="col-3 sidebar py-2 pe-0 ps-0"
                         initial={{ x: 300, opacity: 0 }}
                         animate={{ x: 0, opacity: 1 }}
                         transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                     >
                            <ShowChatInfo
                                selectedChat={auth.selectedChat}
                                onCloseChatInfo={() => setShowChatInfo(false)}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
};

export default Messenger;
