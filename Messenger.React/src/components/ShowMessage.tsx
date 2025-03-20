import { FC, useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import Message from "../Models/Message";
import { format, parse } from 'date-fns';

interface MessageProps {
    Message: Message;
}

const ShowMessage: FC<MessageProps> = ({ Message }) => {
    const auth = useContext(AuthContext);
    const isMyMessage = auth.user!.id === Message.senderId;
    const date = parse(Message.timestamp, 'yyyy:MM:dd:HH:mm:ss', new Date());
    const formattedDate = isNaN(date.getTime()) 
    ? 'Invalid Date' 
    : format(date, 'HH:mm');   
    return (
        <div className={`col-12 d-flex ${isMyMessage ? 'justify-content-end' : 'justify-content-start'}`}>
            <div className={`message-box mt-2 ${isMyMessage ? 'my-message' : 'other-message'}`}>
                {Message.content}
                <div className="message-footer">
                    <span className="message-date">{formattedDate}</span>
                    {/* {isMyMessage && <FaCheckDouble className="message-check" />} */}
                </div>
            </div>
        </div>
    );
};


export default ShowMessage;
