import { ChangeEvent, FC, MouseEvent, useContext, useEffect, useState } from "react";
import RenderMessages from "../components/Message/RenderMessages";
import Chat from "../Models/Chat";
import useIndexedDBMessenger from "../hooks/indexedDbMessenger.hook";
import ChatsCortage from "../Models/ResponsModels/ChatsCortage";
import { getSavedChatsService, globalChatSearchByNameService } from "../services/chats";
import SidebarProfile from "../components/Profile/SidebarProfile";
import searchedGlobalChats from "../Models/ResponsModels/SerchedGlobalChats";
import MessageForm from "../components/MessageInputForm/MessageForm";
import ChatHeader from "../components/ChatInformation/ChatHeader";
import ShowChatInfo from "../components/ChatInformation/ShowChatInfo";
import SidebarChats from "../components/Chats/SidebarChats";
import SidebarEditProfile from "../components/Profile/SidebarEditProfile";
import { useAppDispatch, useAppSelector } from "../store/store";
import { addChat, addChats, changeCountOfUnreadedMessages, changeTopMessage } from "../store/features/chatSlice";
import { getChatById, getSearchedChatById } from "../store/features/chatService";
import { AuthContext } from "../context/AuthContext";
import Message from "../Models/Message";
import { addMessage } from "../store/features/messageSlice";
import messagesReadedPayload from "../Models/ResponsModels/messagesReadedPayload";
import { getChatService as getChatService } from "../services/chats";
import '../assets/styles/bootstrap.min.css';
import '../assets/styles/MainMenueStyles/MainMenue.css';
import '../assets/styles/style.css';
import { setSearchedChats } from "../store/features/searchedChatsSlice";
import { AnimatePresence } from "framer-motion";


const Messenger: FC = () => {
    const selectedChatId = useAppSelector(state => state.selectedChat).chatId;
    const selectedChat = useAppSelector(state => getChatById(selectedChatId)(() => state)) 
        ? useAppSelector(state => getChatById(selectedChatId)(() => state)) 
        : useAppSelector(state => getSearchedChatById(selectedChatId)(() => state)); 

    const { user, token } = useAppSelector(state => state.user);
    const dispatch = useAppDispatch();

    const connection = useContext(AuthContext);

    const [searchChatName, setSearchChat] = useState("");
    const [debouncedTerm, setDebouncedTerm] = useState(searchChatName);

    const [isGlobalSearch, setIsGlobalSearch] = useState(false);
    const [showSavedChats, setShowSavedChats] = useState(true);
    const [showSearchedChats, setShowSearchedSavedChats] = useState(false);

    const [showProfile, setShowProfile] = useState(false)
    const [showEditProfile, setShowEditProfile] = useState(false)

    const [showChatInfo, setShowChatInfo] = useState(false);

    const { openDb, getChats, getChatsByName, getChat, addPrivateChats, addGroupChats, addChat: addChatDb, GetCountOfUnReadedMessages: GetCountOfUnReadedMessagesDB, addMessage: addMessageDB } = useIndexedDBMessenger()

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
        getSavedChatsService(token).then((chats: ChatsCortage | null) => {
            if (chats) {
                addPrivateChats(chats.privateChats);
                addGroupChats(chats.groupChats);
                getChats().then((chats) => {
                    dispatch(addChats({ chats: chats }))
                });
            }
        });

    }, [DbOpened])

    useEffect(() => {
        if (!connection.connection) return;
        const handleReceiveMessage = async (message: Message, status: number) => {
            if (status == 200) {
                if (DbOpened) {
                    if (message && user) {
                        const selectedChatId = window.sessionStorage.getItem("selectedChatId");
                        if (selectedChatId == message.chatId && user.id != message.senderId) {
                            message.isReaded = true;
                            const messagesReadedPayload: messagesReadedPayload = {
                                chatId: selectedChatId,
                                userId: user.id,
                                messegeIds: [message.id]
                            };
                            if (connection.connection){
                                connection.connection.invoke("MessagesReaded", messagesReadedPayload);
                            }
                        }
                        if (await getChat(message.chatId) == null) {
                            console.log(message)
                            const newChat = await getChatService(token, message.chatId);
                            dispatch(addChat({ chat: newChat }));
                            await addChatDb(newChat);
                        }
                        
                        const processingMessage = async () => {
                            await addMessageDB(message);
                            if (message.chatId === selectedChatId) {
                                dispatch(addMessage({ message: message }));
                            }
                        };
                        processingMessage();

                        const addToChatTopMessage = async () => {
                            dispatch(changeTopMessage({ chatId: message.chatId, newTopMessage: message }));
                        };
                        addToChatTopMessage();

                        const GetCountOfUnReadedMessages = async () => {
                            const unReaded: number = await GetCountOfUnReadedMessagesDB(message.chatId);
                            dispatch(changeCountOfUnreadedMessages({ chatId: message.chatId, count: unReaded }))
                        };
                        GetCountOfUnReadedMessages();
                    }
                }

            }
        };

        connection.connection.on("ReceiveMessage", handleReceiveMessage);

        return () => {
            connection.connection?.off("ReceiveNewChatName", handleReceiveMessage);
        };
    }, [connection.connection, DbOpened]);

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
                    dispatch(setSearchedChats({chats:chats}))
                    setIsGlobalSearch(false);
                }
                else { //Глобальний пошук всіх приватних та групових чатів за назвою                    
                    setIsGlobalSearch(true);
                    const data: searchedGlobalChats = await globalChatSearchByNameService(token, searchChatName);
                    const chats: Chat[] = [...data.privateChats, ...data.groupChats];
                    dispatch(setSearchedChats({chats:chats}))
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
            const GetChats = async () => {
                const savedChats = await getChats();
                dispatch(addChats({ chats: savedChats }))
            }
            GetChats();
        }
    };

    const handleLeftSearchMode = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setSearchChat("");
        if (DbOpened) {
            try {
                const chats = await getChats();
                dispatch(addChats({ chats: chats }))
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

    return (
        <div className="h-100 text-color-main-menu">
            <div className="row h-100">

                {(showSavedChats || showSearchedChats) && (
                    <SidebarChats
                        showSavedChats={showSavedChats}
                        showSearchedChats={showSearchedChats}
                        isGlobalSearch={isGlobalSearch}
                        searchChatName={searchChatName}
                        handleSearchChange={handleSearchChange}
                        onProfileSelect={onProfileSelect}
                        handleLeftSearchMode={handleLeftSearchMode}
                    />
                )}
                {((showProfile && !showEditProfile) && user) && (
                    <SidebarProfile
                        handleLeftProfileMode={handleLeftSearchMode}
                        handleEditProfileMode={() => setShowEditProfile(true)}
                    />
                )}

                {showEditProfile && user && (
                    <SidebarEditProfile
                        onLeftEditProfileMode={() => setShowEditProfile(false)}
                    />
                )}

                <div className={`${showChatInfo ? "col-6" : "col-9"} chat ps-0 pe-0`}>
                    {!!selectedChat && selectedChat!.id != undefined && (
                        <>
                            <ChatHeader user={user!} onOpenChatInfo={() => setShowChatInfo(true)} />

                            <RenderMessages key={selectedChat.id} />

                            <MessageForm />
                        </>
                    )}
                </div>

                {(showChatInfo) && !!selectedChat && selectedChat!.id !== undefined && (
                    <ShowChatInfo
                        onCloseChatInfo={() => setShowChatInfo(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default Messenger;
