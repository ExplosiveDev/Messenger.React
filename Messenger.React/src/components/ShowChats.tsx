import React, { FC, MouseEvent, useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import ShowChat from "./ShowChat";
import PrivateChat from "../Models/PrivateChat";
import GroupChat from "../Models/GroupChat";
import Chat from "../Models/Chat";
import { MessengerContex } from "../context/MessegerContext";

interface ChatsProps {
  Chats: Chat[];
}

const ShowChats: FC<ChatsProps> = ({ Chats }) => {
  const auth = useContext(AuthContext);
  
  const isPrivateChat = (chat: Chat): chat is PrivateChat => {
    return (chat as PrivateChat).user1 !== undefined && (chat as PrivateChat).user2 !== undefined;
  };

  const isGroupChat = (chat: Chat): chat is GroupChat => {
    return (chat as GroupChat).groupName !== undefined;
  };

  return (
    <div className="d-flex flex-column m-0">
      {Chats.length > 0 &&
        Chats.map((chat) => {
          if (isPrivateChat(chat)) {
            const user1Name = chat.user1?.userName || "Unknown User";
            const user2Name = chat.user2?.userName || "Unknown User";
            const chatName = user1Name === auth.user?.userName ? user2Name : user1Name;
            return <ShowChat Chat={chat} ChatName={chatName} key={chat.id} />;
          } else if (isGroupChat(chat)) {
            return <ShowChat Chat={chat} ChatName={chat.groupName} key={chat.id} />;
          } else {
            return null;
          }
        })}
    </div>
  );
};

export default ShowChats;
