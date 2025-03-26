import { FC, useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import Message from "../Models/Message";
import { format, parse } from 'date-fns';
import TextMessage from "../Models/TextMessage";
import useIndexedDBMessenger from "../hooks/indexedDbMessenger.hook";
import MediaMessage from "../Models/MediaMessage";
import myFile from "../Models/File";

interface MessageProps {
    Message: Message;
}

const ShowMessage: FC<MessageProps> = ({ Message }) => {
    const auth = useContext(AuthContext);
    const { isTextMessage, isMediaMessage } = useIndexedDBMessenger()
    const isMyMessage = auth.user!.id === Message.senderId;
    const date = parse(Message.timestamp, 'dd.MM.yyyy HH:mm:ss', new Date());
    const formattedDate = isNaN(date.getTime())
        ? 'Invalid Date'
        : format(date, 'HH:mm');
    return (
        <div className={`col-12 d-flex ${isMyMessage ? 'justify-content-end' : 'justify-content-start'}`}>
            <div className={`message-box mt-2 ${isMyMessage ? 'my-message' : 'other-message'}`}>
                {isTextMessage(Message) && (
                    <>
                        {Message.content}
                        <div className="message-footer">
                            <span className="message-date">{formattedDate}</span>
                            {/* {isMyMessage && <FaCheckDouble className="message-check" />} */}
                        </div>
                    </>
                )}
                {isMediaMessage(Message) && (
                    <div className="media-message">

                        <img src={Message.content[0].url} alt="" />
                       
                        <div className="message-footer justify-content-start"> 
                            <span className="message-caption">{Message.caption != "" ? Message.caption : null}</span>
                        </div>
                        <div className="message-footer">
                            <span className="message-date">{formattedDate}</span>
                            {/* {isMyMessage && <FaCheckDouble className="message-check" />} */}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};


export default ShowMessage;
