import { ChangeEvent, FC, FormEvent, useContext, useEffect, useState } from "react";
import '../assets/styles/bootstrap.min.css'
import '../assets/styles/style.css'
import '../assets/styles/MainMenueStyles/MainMenue.css'

import { AuthContext } from "../context/AuthContext";

const Messenger: FC = () => {
    const auth = useContext(AuthContext);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        auth.connection!.invoke("SendMessage", "Hello")
    };

    return (
        <div className="container-fluid h-100 ps-1 text-color-main-menu">
        <div className="row h-100">
            <div className="col-3 sidebar pe-0 ps-2">
            <div className="chat-header mb-2">Chats</div>
                <div className="search-bar">
                    <input type="text" className="form-control" placeholder="Search"/>
                </div>

            </div>
            <div className="col-9 chat ps-1 pe-1">
                <div className="chat-header">Chat Header</div>
                <div className="messages m-0 p-0"></div>
                <div className="input-container">
                    <input type="text" className="form-control" placeholder="Message"/>
                    <button className="btn btn-primary ml-2">Send</button>
                </div>
            </div>
        </div>
    </div>
    )
}

export default Messenger
