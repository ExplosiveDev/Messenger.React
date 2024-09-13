import { ChangeEvent, FC, FormEvent, MouseEvent, useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { IndexedDBContext } from "../context/IndexedDbContext"; // Імпорт контексту
import RenderMessages from "../components/RenderMessages";
import User from "../Models/User";
import axios from "axios";
import ShowChats from "../components/ShowChats";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';

import '../assets/styles/bootstrap.min.css';
import '../assets/styles/style.css';
import '../assets/styles/MainMenueStyles/MainMenue.css';
import Message from "../Models/Message";
import { getAllMessages } from "../services/messages";
import useIndexedDB from "../hooks/indexedDb.hook";

interface sendMessagePayload {
    message: string,
    userId: string
}

const Messenger: FC = () => {
    const auth = useContext(AuthContext);

    const [searchChat, setSearchChat] = useState("");
    const [message, setMessage] = useState("");
    const [debouncedTerm, setDebouncedTerm] = useState(searchChat);
    const [chats, setChats] = useState<User[]>([]) // тимчасово User[]
    const [showModal, setShowModal] = useState(false);
    const {openDb,getData,addData,addDataRange,db,} = useIndexedDB("Messages")

    const [dbOpened, setDbOpened] = useState(false); // Стан для контролю, чи відкрито базу даних

    useEffect(() => {
        const initDb = async () => {
            try {
                await openDb();
                setDbOpened(true); 
                console.log("IndexedDB opened");
            } catch (error) {
                console.error("Error opening IndexedDB:", error);
            }
        };

        initDb();
    }, []); 

    useEffect(() => {
        if (!dbOpened || !auth.token) return; 

        const fetchMessages = async () => {
            await openDb()
            try {
                const messages: Message[] = await getAllMessages(auth.token!);

                if (messages.length > 0) {
                    await addDataRange(messages);
                }
            } catch (error) {
                console.error("Error retrieving or adding messages:", error);
            }
        };

        fetchMessages();
    }, [dbOpened, auth.token]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchChat.length === 0) {
                setChats([]);
                return;
            }
            setDebouncedTerm(searchChat);
        }, 500); // 500 мс затримка

        return () => {
            clearTimeout(handler);
        };
    }, [searchChat]);

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
                setChats(data);
            } catch (error) {
                console.error('Search failed:', error);
            }
        };

        if (debouncedTerm) {
            console.log("Search Term after debounce: ", debouncedTerm);
            fetchData();
        }
    }, [debouncedTerm]);

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchChat(e.target.value);
    };

    const handleMessageChange = (e: ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);
    };

    const handleSubmitMessage = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const sendMessagePayload: sendMessagePayload = {
            message: message,
            userId: auth.selectedChat?.id!
        };
        auth.connection!.invoke("SendMessage", sendMessagePayload);
    };

    const newContactHandleClick = (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setShowModal(true);
    };

    const handleButtonClickClose = (value: string) => {
        console.log(`Button clicked: ${value}`);
        setShowModal(false);
    };

    return (
        <div className="h-100 text-color-main-menu">
            <div className="row h-100">
                <div className="col-3 sidebar ps-0 pe-0">
                    <div className="chat-header mb-2">Chats</div>
                    <div className="search-bar ps-2 pe-2 d-flex">
                        <div className="dropdown">
                            <button className="btn btn-secondary me-2" type="button" id="dropdownMenuButton2" data-bs-toggle="dropdown" aria-expanded="false">
                                <FontAwesomeIcon icon={faEllipsisV} />
                            </button>
                            <ul className="dropdown-menu dropdown-menu-dark" aria-labelledby="dropdownMenuButton2">
                                <li><a className="dropdown-item " href="" onClick={newContactHandleClick}>New contact</a></li>
                            </ul>
                        </div>
                        <input type="text" className="form-control mb-1 " placeholder="Search" onChange={handleSearchChange} />

                    </div>
                    <div className="row">
                        {chats.map((chat) => {
                            return <ShowChats Chat={chat} key={chat.id} />
                        })}
                    </div>
                </div>

                <div className="col-9 chat ps-0 pe-0">
                    {!!auth.selectedChat && (
                        <>
                            <div className="chat-header">Chat Header</div>
                            <div className="messages ms-5 me-5 ps-5 pe-5">
                                <RenderMessages ChatId={"1212"}></RenderMessages>
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

            {showModal && (
                <div className="modal fade show d-block" id="chatModal" tabIndex={-1} role="dialog" aria-labelledby="chatModalLabel" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="chatModalLabel">Chat with </h5>
                                <button type="button" className="close" onClick={() => handleButtonClickClose('close')} aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <p className="m-0 p-0">Ви впевнені, хочете створити чат з .</p>
                            </div>
                            <div className="d-flex justify-content-center modal-footer">
                                <button type="button" className="btn btn-outline-danger me-2" >No</button>
                                <button type="button" className="btn btn-outline-success ms-2" >Yes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>


    );
};

export default Messenger;
