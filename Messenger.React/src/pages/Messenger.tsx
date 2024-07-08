import { ChangeEvent, FC, FormEvent, useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import RenderMessages from "../components/RenderMessages";
import User from "../Models/User";
import axios from "axios";
import ShowChats from "../components/ShowChats";

import '../assets/styles/bootstrap.min.css'
import '../assets/styles/style.css'
import '../assets/styles/MainMenueStyles/MainMenue.css'
import Message from "../Models/Message";

const Messenger: FC = () => {
    const auth = useContext(AuthContext);
    const [searchChat, setSearchChat] = useState("");
    const [message, setMessage] = useState("");
    const [debouncedTerm, setDebouncedTerm] = useState(searchChat);
    const [chats, setChats] = useState<User[]>([]) //тимчасово User[]

    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchChat.length == 0) {
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

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        auth.connection!.invoke("SendMessage", message);
    };

    useEffect(() => {
        auth.connection!.on("ReceiveMessage", (message: Message) => {
            console.log(message);
        });
    }, [auth.connection]);

    return (
        <div className="h-100 text-color-main-menu  ">
            <div className="row h-100">
                <div className="col-3 sidebar ps-0 pe-0">
                    <div className="chat-header mb-2 ">Chats</div>
                    <div className="search-bar ps-2 pe-2">
                        <input type="text" className="form-control mb-1" placeholder="Search" onChange={handleSearchChange} />
                        <div className="row ">
                            {chats.map((chat) => {
                                return <ShowChats Chat={chat} key={chat.id} />
                            })}
                        </div>
                        {/* <RenderChats Chats={chats}></RenderChats> */}
                    </div>
                </div>

                <div className="col-9 chat ps-0 pe-0">
                    {!!auth.selectedChat && (
                        <>

                            <div className="chat-header">Chat Header</div>
                            <div className="messages ms-5 me-5 ps-5 pe-5">
                                <RenderMessages ChatId={"1212"}></RenderMessages>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="input-container mb-3 ms-5 me-5 ps-5 pe-5">
                                    <input type="text" className="form-control" placeholder="Message" onChange={handleMessageChange} />
                                    <button className="btn btn-primary ml-2" type="submit">Send</button>
                                </div>
                            </form>

                        </>
                    )
                    }
                </div>
            </div>
        </div>
    )
}

export default Messenger
