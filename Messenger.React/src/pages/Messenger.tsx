import { ChangeEvent, FC, FormEvent, MouseEvent, useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import RenderMessages from "../components/RenderMessages";
import User from "../Models/User";
import axios from "axios";
import ShowChats from "../components/ShowChats";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

import '../assets/styles/bootstrap.min.css';
import '../assets/styles/style.css';
import '../assets/styles/MainMenueStyles/MainMenue.css';
import Message from "../Models/Message";
import { getAllMessages } from "../services/messages";
import useIndexedDB from "../hooks/indexedDb.hook";
import { MessageContex } from "../context/MessageContext";
import IndexedDbMessageEntity from "../Models/IndexedDbMessageEntity";
import { useMessage } from "../hooks/message.hook";

interface sendMessagePayload {
    message: string,
    senderUserId: string
    receiverUserId: string
}

const Messenger: FC = () => {
    const auth = useContext(AuthContext);
    const newMessages = useContext(MessageContex);

    const [searchChat, setSearchChat] = useState("");
    const [message, setMessage] = useState("");
    const [debouncedTerm, setDebouncedTerm] = useState(searchChat);
    const [savedChats, setSavedChats] = useState<User[]>([]); // тимчасово User[]
    const [newChats, setNewChats] = useState<User[]>([]); // тимчасово User[]

    const [showSavedChats, setShowSavedChats] = useState(true);
    const [showNewChats, setShowNewChats] = useState(false);
    // const [showModal, setShowModal] = useState(false);



    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchChat.length === 0) {
                setShowNewChats(false);
                setShowSavedChats(true);
                return;
            }
            setDebouncedTerm(searchChat);
        }, 200); // 500 мс затримка

        return () => {
            clearTimeout(handler);
        };
    }, [searchChat]);

    useEffect(() => {
        if (newMessages.chats)
            setSavedChats(newMessages.chats);

        console.log(newMessages.chats)
    }, [newMessages.chats])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.post<User[]>(
                    `https://localhost:7250/Users/SearchUser`,
                    searchChat,
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );
                const data = response.data;
                setNewChats(data);
            } catch (error) {
                console.error('Search failed:', error);
            }
        };


        if (debouncedTerm) {
            fetchData();
        }
    }, [debouncedTerm]);

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchChat(e.target.value);
        if (e.target.value.length > 0) {
            if (!showNewChats)
                setShowNewChats(true)
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
            message: message,
            senderUserId: auth.user?.id!,
            receiverUserId: auth.selectedChat?.id!
        };
        auth.connection!.invoke("SendMessage", sendMessagePayload);
    };

    const handleLeftSearchMode = async (e: MouseEvent<HTMLButtonElement>) => {
        setShowNewChats(false);
        setSearchChat("");
        setShowSavedChats(true);
    }

    return (
        <div className="h-100 text-color-main-menu">
            <div className="row h-100">
                <div className="col-3 sidebar ps-0 pe-0">
                    <div className="chat-header mb-2">Chats</div>
                    <div className="search-bar ps-2 pe-2 d-flex">
                        {
                            showSavedChats && (
                                <button className="btn btn-secondary me-2 mb-2" type="button" aria-expanded="false">
                                    <FontAwesomeIcon icon={faEllipsisV} />
                                </button>
                            )
                        }
                        {
                            showNewChats && (
                                <button className="btn btn-secondary me-2  mb-2" type="button" id="left" aria-expanded="false" onClick={handleLeftSearchMode}>
                                    <FontAwesomeIcon icon={faArrowLeft} />
                                </button>
                            )
                        }
                        <input type="text" className="form-control mb-1 " placeholder="Search" value={searchChat} onChange={handleSearchChange} />

                    </div>
                    {
                        <>
                        {
                            showSavedChats && (
                                <ShowChats Chats={savedChats} ShowMode="savedchats" key={"savedChats"} />
                            )
                        }
                        {
                            showNewChats && (
                                <ShowChats Chats={newChats} ShowMode="newchats" key={"newChats"} />
                            )
                        }
                        </>
                    }
                </div>

                <div className="col-9 chat ps-0 pe-0">
                    {!!auth.selectedChat && (
                        <>
                            <div className="chat-header">{auth.selectedChat.userName}</div>
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
