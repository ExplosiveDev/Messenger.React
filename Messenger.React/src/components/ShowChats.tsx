import React, { FC, MouseEvent, useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import User from "../Models/User";
import '../assets/styles/modalWindow/Modal.css'
import ShowChat from "./ShowChat";

interface ChatProps {
  Chats: User[];
  ShowMode: string;
}

const ShowChats: FC<ChatProps> = ({ Chats, ShowMode }) => {
  const auth = useContext(AuthContext);

  return (
    <div className="row" >


      {ShowMode === "savedchats" && (
        Chats.map((chat) => {
          return <ShowChat Chat={chat} key={chat.id} />
        })
      )
      }

      {ShowMode === "newchats" && (
        Chats.map((chat) => {
          return <ShowChat Chat={chat} key={chat.id} />
        })
      )
      }


    </div >
  )

};

export default ShowChats;
