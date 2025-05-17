import { FC, MouseEvent, useContext } from "react";
import Message from "../../Models/Message";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";
import "../../assets/styles/ContextMenue.css";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { addAction } from "../../store/features/actionMessageSlice";
import { RemoveMessageService } from "../../services/messages";
import { AuthContext } from "../../context/AuthContext";

interface MessageContextMenuProps {
    position: { x: number; y: number };
    message: Message;
    onClose: () => void;
}

const MessageContextMenu: FC<MessageContextMenuProps> = ({ position, message, onClose }) => {
    const actions = useAppSelector(state => state.actionMessage).actions;
    const dispatch = useAppDispatch();
    const token = useAppSelector(state => state.user).token;
    const auth = useContext(AuthContext);


    const handleAction = async (e: MouseEvent<HTMLButtonElement>, action: string) => { 
        if(action === actions.Edit) dispatch(addAction({actionType:action, message: message}));

        if(action === actions.Delete){
            const removedMessageId = await RemoveMessageService(token, message.id);
            if(removedMessageId != null && auth.connection){
                const data = {
                    messageId: message.id,
                    chatId: message.chatId,
                }
                auth.connection.invoke("RemoveMessage", data);
            }
        }

        onClose(); 
    };

    return (
        <motion.div
            className="context-menu"
            style={{
                top: position.y,
                left: position.x,
            }}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()} 
        >
            <div className="menu-header">{message.timestamp}</div>
            <button onClick={(e) => handleAction(e, actions.Edit)}>
                <FontAwesomeIcon icon={faEdit} />
                Edit
            </button>
            <button onClick={(e) => handleAction(e, actions.Copy)}>
                <FontAwesomeIcon icon={faCopy} />
                Copy
            </button>
            <button onClick={(e) => handleAction(e, actions.Delete)} className="delete">
                <FontAwesomeIcon icon={faTrash} />
                Delete
            </button>
        </motion.div>
    );
};

export default MessageContextMenu;