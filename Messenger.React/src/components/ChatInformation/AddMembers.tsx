import { FC, useContext, useEffect, useState, useRef, MouseEvent } from "react";
import { AuthContext } from "../../context/AuthContext";
import User from "../../Models/User";
import { GetContactsService } from "../../services/users";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import Chat from "../../Models/Chat";
import GroupChat from "../../Models/GroupChat";
import AddMembersRequest from "../../Models/RequestModels/AddMembersRequest";
import { AddMembersService } from "../../services/chats";
import { addChat, addMembers } from "../../store/features/chatSlice";

interface AddMembersProps {
    Chat: Chat;
};

const AddMembers: FC<AddMembersProps> = ({ Chat }) => {
    const token = useAppSelector(state => state.user).token;
    const dispatch = useAppDispatch();

    let existMembers: string[] = [];
    const auth = useContext(AuthContext);
    const [showModal, setShowModal] = useState(false);
    const [contacts, setContacts] = useState<User[]>([]);
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: Event) => {
            if (modalRef.current && showModal && !modalRef.current.contains(event.target as Node)) {
                setShowModal(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showModal]);

    useEffect(() => {
        const fetchContacts = async () => {
            const Contacts: User[] = await GetContactsService(token);
            (Chat as GroupChat).userChats.forEach((uc) => existMembers.push(uc.userId));
            setContacts(Contacts.filter((u) => !existMembers.includes(u.id)));
        }
        fetchContacts();
    }, [Chat])

    const handleContactToggle = (id: string) => {
        setSelectedContacts((prev) =>
            prev.includes(id)
                ? prev.filter((c) => c !== id)
                : [...prev, id]
        );
    };
    const handleAddMembers = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (selectedContacts.length > 0) {
            const addMembersRequest: AddMembersRequest = {
                chatId: Chat.id,
                memberIds: selectedContacts
            }

            const newMembers: User[] | null = await AddMembersService(token, addMembersRequest);
            if (newMembers) {
                dispatch(addMembers({ chatId: Chat.id, newMembers: newMembers }));
                auth.connection?.invoke("SendNewChat",{chatId:Chat.id, newMemberIds:selectedContacts});
                setSelectedContacts([]);
            }
        }

    }
    return (
        <>
            <motion.div className="fab-container"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                <button
                    className="fab chat-hover"
                    aria-label="Floating Action Button"
                    onClick={() => { setShowModal(true) }}
                >
                    <FontAwesomeIcon icon={faUserPlus} />
                </button>
            </motion.div>
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content dark-modal" ref={modalRef}>
                        <div className="modal-header">
                            <h5 className="modal-title">До дадати користувача до чату</h5>
                        </div>
                        <div className="modal-body">
                            <div className="contacts-section">
                                <label className="form-label">Оберіть користувача:</label>
                                <div className="contacts-scrollable">
                                    {contacts.map((contact) => (
                                        <div key={contact.id} className="contact-item">
                                            <input
                                                type="checkbox"
                                                id={`contact-${contact.id}`}
                                                checked={selectedContacts.includes(contact.id)}
                                                onChange={() => handleContactToggle(contact.id)}
                                            />
                                            <label htmlFor={`contact-${contact.id}`} className="contact-label">
                                                <img
                                                    src={contact.activeAvatar?.url || "/default-avatar.png"}
                                                    alt={contact.userName}
                                                    className="contact-avatar"
                                                />
                                                <span className="contact-name">{contact.userName}</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn-secondary"
                                    onClick={() => { setShowModal(false) }}
                                >
                                    Скасувати
                                </button>
                                <button
                                    className="btn-primary"
                                    onClick={handleAddMembers}
                                >
                                    Додати
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </>


    );
};

export default AddMembers;