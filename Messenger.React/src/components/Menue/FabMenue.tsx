import { FC, MouseEvent, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTimes, faUsers, faCommentDots, faBullhorn } from "@fortawesome/free-solid-svg-icons";
import User from "../../Models/User";
import { GetContactsService } from "../../services/users";
import CreateGroupChatRequest from "../../Models/RequestModels/CreateGroupChatReques";
import GroupChat from "../../Models/GroupChat";
import { createGroupChatService } from "../../services/chats";
import useIndexedDBMessenger from "../../hooks/indexedDbMessenger.hook";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { setSelectedChat } from "../../store/features/selectedChatSlice";
import { addChat } from "../../store/features/chatSlice";

import "../../assets/styles/MainMenueStyles/FabMenue.css"

const FabMenu: FC = () => {
    const dispatch = useAppDispatch();
    const token = useAppSelector(state => state.user).token;

    const { openDb, addGroupChat } = useIndexedDBMessenger()
    const [DbOpened, setDbOpened] = useState(false);

    const [isOpen, setIsOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [contacts, setContacts] = useState<User[]>([]);
    const [groupName, setGroupName] = useState("");
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
    const [errorMessage, setErrorMessage] = useState("");

    const faRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initChatsDb = async () => {
            try {
                await openDb();
                setDbOpened(true);
            } catch (error) {
                console.error("Error opening IndexedDB:", error);
            }
        };
        initChatsDb();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: Event) => {
            if (faRef.current && !faRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
            if (modalRef.current && showModal && !modalRef.current.contains(event.target as Node)) {
                setShowModal(false);
                setContacts([]);
                setGroupName("");
                setErrorMessage("");
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showModal]);

    const handleCreateGroup = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const Contacts: User[] = await GetContactsService(token);
        setIsOpen(false);
        setShowModal(true);
        setContacts(Contacts);
    }
    const handleClose = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setShowModal(false);
        setContacts([]);
        setGroupName("");
        setErrorMessage("");
    }
    const handleContactToggle = (id: string) => {
        setSelectedContacts((prev) =>
            prev.includes(id)
                ? prev.filter((c) => c !== id)
                : [...prev, id]
        );
    };

    const CreateGroup = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (!groupName.trim()) {
            setErrorMessage("Назва групи обов'язкова");
            return;
        }

        if (selectedContacts.length === 0) {
            setErrorMessage("Потрібно вибрати хоча б один контакт");
            return;
        }

        setErrorMessage("");
        setShowModal(false);

        const CreatGroupRequest: CreateGroupChatRequest = {
            selectedContacts: selectedContacts,
            groupName: groupName
        }
        
        const groupChat:GroupChat = await createGroupChatService(token, CreatGroupRequest);
        await addGroupChat(groupChat);
        dispatch(addChat({chat:groupChat}));
        dispatch(setSelectedChat({chat:groupChat}));
        console.log(groupChat);
    }

    return (
        <div className="fab-container">
            <button
                className="fab chat-hover"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label="Floating Action Button"
            >
                <FontAwesomeIcon icon={isOpen ? faTimes : faPlus} />
            </button>

            {isOpen && (
                <div className="fab-menu" ref={faRef}>
                    <button >
                        <FontAwesomeIcon icon={faBullhorn} />
                        New Channel
                    </button>
                    <button onClick={handleCreateGroup}>
                        <FontAwesomeIcon icon={faUsers} />
                        New Group
                    </button>
                    <button >
                        <FontAwesomeIcon icon={faCommentDots} />
                        New Private Chat
                    </button>
                </div>
            )}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content dark-modal" ref={modalRef}>
                        <div className="modal-header">
                            <h5 className="modal-title">Створення групового чата</h5>
                            <button
                                className="close-btn"
                                onClick={handleClose}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group mb-3">
                                <label htmlFor="groupName" className="form-label">Назва групи</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="groupName"
                                    placeholder="Введіть назву групи"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                />
                            </div>

                            <div className="contacts-section">
                                <label className="form-label">Оберіть контакти:</label>
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
                                {errorMessage && (
                                    <div className="error-message">
                                        {errorMessage}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn-secondary"
                                onClick={handleClose}
                            >
                                Скасувати
                            </button>
                            <button
                                className="btn-primary"
                                onClick={CreateGroup}
                            >
                                Створити
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
};

export default FabMenu;
