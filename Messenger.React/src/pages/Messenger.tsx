import { ChangeEvent, FC, MouseEvent, useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import RenderMessages from "../components/RenderMessages";
import { MessengerContex } from "../context/MessegerContext";
import Chat from "../Models/Chat";
import useIndexedDBMessenger from "../hooks/indexedDbMessenger.hook";
import ChatsCortage from "../Models/ResponsModels/ChatsCortage";
import { getSavedChats, globalChatSearchByName } from "../services/chats";
import { getChat as getChatService } from "../services/chats";
import SidebarProfile from "../components/SidebarProfile";
import searchedGlobalChats from "../Models/ResponsModels/SerchedGlobalChats";
import MessageForm from "../components/MessageForm";
import ChatHeader from "../components/ChatHeader";
import ShowChatInfo from "../components/ShowChatInfo";
import SidebarChats from "../components/SidebarChats";

import '../assets/styles/bootstrap.min.css';
import '../assets/styles/MainMenueStyles/MainMenue.css';
import '../assets/styles/style.css';
import SidebarEditProfile from "../components/SidebarEditProfile";


const Messenger: FC = () => {
    const auth = useContext(AuthContext);
    const messenger = useContext(MessengerContex);

    const [searchChatName, setSearchChat] = useState("");
    const [debouncedTerm, setDebouncedTerm] = useState(searchChatName);

    const [savedChats, setSavedChats] = useState<Chat[]>([]);
    const [searchedChats, setSearchedChats] = useState<Chat[]>([]);

    const [isGlobalSearch, setIsGlobalSearch] = useState(false);
    const [showSavedChats, setShowSavedChats] = useState(true);
    const [showSearchedChats, setShowSearchedSavedChats] = useState(false);
    const [showProfile, setShowProfile] = useState(false)
    const [showEditProfile, setShowEditProfile] = useState(false)
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

    useEffect( () => {
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
        e.preventDefault();
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
        if (!showSavedChats) setShowSavedChats(true);
    }

    const onProfileSelect = () => {
        setShowSavedChats(false);
        setShowProfile(true);
    }

    const onEditProfileSelect = () => {
        setShowEditProfile(true);
    }

    const onLeftEditProfileMode = () => {
        setShowEditProfile(false);
    }
    return (
        <div className="h-100 text-color-main-menu">
            <div className="row h-100">

                {(showSavedChats || showSearchedChats) && (
                    <SidebarChats 
                        showSavedChats={showSavedChats} 
                        showSearchedChats={showSearchedChats} 
                        isGlobalSearch={isGlobalSearch}
                        searchChatName={searchChatName}
                        searchedChats={searchedChats}
                        savedChats={savedChats}
                        handleSearchChange={handleSearchChange}
                        onProfileSelect={onProfileSelect}
                        handleLeftSearchMode={handleLeftSearchMode}
                        >
                    </SidebarChats>
                )}

                {( (showProfile && !showEditProfile) && auth.user) && (
                    <SidebarProfile 
                        User={auth.user} 
                        handleLeftProfileMode={handleLeftSearchMode} 
                        handleEditProfileMode={onEditProfileSelect}
                        >
                    </SidebarProfile>
                )}

                {showEditProfile && auth.user && (
                    <SidebarEditProfile 
                        onLeftEditProfileMode={onLeftEditProfileMode}
                        User={auth.user} 
                    >

                    </SidebarEditProfile>
                )}


                <div className={`${showChatInfo ? "col-6" : "col-9"} chat ps-0 pe-0`}>
                    {!!auth.selectedChat && auth.selectedChat!.id != undefined && (
                        <>
                            <ChatHeader selectedChat={auth.selectedChat} user={auth.user!} onOpenChatInfo={() => setShowChatInfo(true)} />

                            <RenderMessages key={auth.selectedChat.id} ChatId={auth.selectedChat.id} />

                            <MessageForm />
                        </>
                    )}
                </div>

                {showChatInfo && !!auth.selectedChat && auth.selectedChat!.id !== undefined && (
                    <ShowChatInfo
                        selectedChat={auth.selectedChat}
                        onCloseChatInfo={() => setShowChatInfo(false)}
                    />
                )}


            </div>
        </div>
    );
};

export default Messenger;
