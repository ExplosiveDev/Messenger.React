import { FC, useContext, useEffect, useState } from "react";
import { faUserXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "framer-motion";
import UserChat from "../../Models/UserChat";
import { AuthContext } from "../../context/AuthContext";
import RemoveMemberRequest from "../../Models/RequestModels/RemoveMemberRequest";
import { RemoveMember } from "../../services/chats";
import useIndexedDBMessenger from "../../hooks/indexedDbMessenger.hook";
import GroupChat from "../../Models/GroupChat";

interface GroupMembersProps {
    Chat:GroupChat;
};

const GroupMembers: FC<GroupMembersProps> = ({Chat}) => {
    const auth = useContext(AuthContext);
    const [members, setMembers] = useState<UserChat[]>([]);

    const { openDb, removeMember:removeMemberDb } = useIndexedDBMessenger()
    const [DbOpened, setDbOpened] = useState(false)
    
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
        setMembers(Chat.userChats);
    }, [Chat]);
    
    
    const removeMember = async (memberId: string, chatId: string) => {
        const removeMemberRequest:RemoveMemberRequest = {
            memberId: memberId,
            chatId: chatId
        };

        if(auth.token){
            try {
                const id: string | null = await RemoveMember(auth.token, removeMemberRequest);

                if (id && id === memberId) {
                    setMembers(prev => prev.filter(m => m.userId !== memberId));
                    auth.connection?.invoke("RemoveChat", {chatId, userId:memberId});
                    await removeMemberDb(chatId, memberId);
                }
            } catch (error) {
                console.error('Error removing member:', error);
            }
        }
    }

    return (
        <div className="d-flex flex-column m-0">
            <hr />
            <h4 className="m-0 text-center text-secondary">Members</h4>
            <AnimatePresence>
                {members.map((UserChat: UserChat) => (
                    <motion.div
                        key={UserChat.user.id}
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        layout
                    >
                        <div className="col-12 my-1 px-2 position-relative hover-container">
                            <button
                                className="btn w-100 chat-hover d-flex align-items-center"
                                type="button"
                            >
                                <img
                                    className="chat-photo me-2"
                                    src={UserChat.user.activeAvatar.url}
                                    alt="Chat"
                                />
                                <div className="d-flex flex-column text-start flex-grow-1">
                                    <h3 className="chat-name m-0 text-light">{UserChat.user.userName}</h3>
                                </div>

                                {Chat.adminId !=  auth.user?.id || UserChat.user.id != auth.user?.id && (
                                    <button
                                        className="btn btn-danger delete-btn"
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            await removeMember(UserChat.user.id, Chat.id);
                                        }}
                                        style={{
                                            opacity: 0
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faUserXmark} />
                                    </button>
                                )}

                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}

export default GroupMembers;