import { MouseEvent, ChangeEvent, FC, useContext, useEffect, useRef, useState } from "react";
import { faCheck, faClose, faEdit, faPlus, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useIndexedDBMessenger from "../../hooks/indexedDbMessenger.hook";
import { AuthContext } from "../../context/AuthContext";
import User from "../../Models/User";
import GroupChat from "../../Models/GroupChat";
import { AnimatePresence, motion } from "framer-motion";
import "../../assets/styles/MainMenueStyles/Componets.css"
import axios from "axios";
import myFile from "../../Models/File";
import GroupMembers from "./GroupMembers";
import UserInfo from "./UserInfo";
import ChangePhotoModal from "../Modal/ChangePhotoModal";
import { ChangeChatNameService } from "../../services/chats";
import ChangeChatNameRequest from "../../Models/RequestModels/ChangeChatNameRequest";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { getChatById, getSearchedChatById } from "../../store/features/chatService";
import { changeChatAvatar } from "../../store/features/chatSlice";
import AddMembers from "./AddMembers";

interface ShowChatInfoProps {
    onCloseChatInfo?: () => void;
}

const ShowChatInfo: FC<ShowChatInfoProps> = ({onCloseChatInfo }) => {
    const selectedChatId = useAppSelector(state => state.selectedChat).chatId;
    const selectedChat = useAppSelector(state => getChatById(selectedChatId)(() => state)) 
        ? useAppSelector(state => getChatById(selectedChatId)(() => state)) 
        : useAppSelector(state => getSearchedChatById(selectedChatId)(() => state)) ;   
    const dispatch = useAppDispatch();

    const {user, token} = useAppSelector(state => state.user);
    const auth = useContext(AuthContext);
    const { isPrivateChat, isGroupChat } = useIndexedDBMessenger();

    let isPrivateTypeChat!: boolean;
    let AvatarUrl: string = "";
    let ChatUser: User;

    if (selectedChat && isPrivateChat(selectedChat)) {
        const user1 = selectedChat.user1;
        const user2 = selectedChat.user2;
        const chatUser = user1.id === user?.id ? user2 : user1;
        isPrivateTypeChat = true;
        AvatarUrl = chatUser.activeAvatar.url ? chatUser.activeAvatar.url : "http://192.168.0.100:5187/uploads/user.png";
        ChatUser = chatUser;
    }
    if (selectedChat && isGroupChat(selectedChat)) {
        isPrivateTypeChat = false;
        AvatarUrl = selectedChat.activeIcon.url ? selectedChat.activeIcon.url : "http://192.168.0.100:5187/uploads/groups.png";
    }

    const modalRef = useRef<HTMLDivElement>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const [hover, setHover] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isChatNameEditing, setIsChatNameEditing] = useState(false);
    const [editedChatName, setEditedChatName] = useState(
        isPrivateTypeChat ? ChatUser!.userName : (selectedChat as GroupChat).groupName
    );
    const [showButtonSave, setShowButtonSave] = useState(false);

    const handleCloseChatInformation = () => {
        isChatNameEditing && setIsChatNameEditing(false);
        isEditMode ? setIsEditMode(false) : onCloseChatInfo?.();
    }

    const handleOpenEditChat = () => setIsEditMode(true);

    useEffect(() => {
        const handleClickOutside = (event: globalThis.MouseEvent) => {
            if (modalRef.current && showModal && !modalRef.current.contains(event.target as Node)) {
                setShowModal(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);

    }, [showModal]);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setImage(e.target.files[0]);
            setShowModal(true);
            e.target.value = '';
        }
    };

    const handleSubmitPhoto = () => {
        if (image) {
            setShowModal(false)
            const uploadAvatar = async () => {
                if(!selectedChat) return;
                const formData = new FormData();
                formData.append("file", image);
                const response = await axios.post(
                    `http://192.168.0.100:5187/Files/UploadAvatar`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                const avatar: myFile = response.data.activeAvatar;
                dispatch(changeChatAvatar({chatId:selectedChat.id, newChatAvatar: avatar}));
            };
            uploadAvatar();
        }
    };

    const handleChangeChatName = (e: ChangeEvent<HTMLInputElement>) => {
        setEditedChatName(e.target.value);
        if (e.target.value != (selectedChat as GroupChat).groupName) setShowButtonSave(true);
        else setShowButtonSave(false);
    };

    useEffect(() => {
        if (!isChatNameEditing) {
            setShowButtonSave(false);
            setEditedChatName((selectedChat as GroupChat).groupName);
        }
    }, [isChatNameEditing])


    const handleSaveChanges = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (editedChatName) {
            if(!selectedChat) return;
            const changeChatName = async () => {

                const changeChatNameRequest: ChangeChatNameRequest = {
                    newName: editedChatName,
                    chatId: selectedChat.id
                };
                const newChatName = await ChangeChatNameService(token, changeChatNameRequest);
                if (newChatName) {
                    auth.connection?.invoke("ChangeChatName", {chatId:selectedChat.id, newChatName:editedChatName});
                    setIsChatNameEditing(false);
                }

            }
            changeChatName();
        }
    }


    return (
        <AnimatePresence mode="wait">
            <motion.div
                key="chat-info"
                className="col-3 sidebar py-2 pe-0 ps-0"
                initial={{ x: 45, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: .4, ease: [0.25, 0.1, 0.25, 1] }}
            >
                <div className="row px-2 mx-2 " >
                    <div className="col-12 d-flex align-items-center px-0" >
                        <div className="col-2 d-flex  pe-0 ">
                            <button className="btn btn-secondary me-3" type="button" id="left" aria-expanded="false" onClick={handleCloseChatInformation} >
                                <FontAwesomeIcon icon={faClose} />
                            </button>
                        </div>
                        <div className="col-8 d-flex  align-items-center px-0">
                            <h4 className="m-0 fw-bold">{isPrivateTypeChat ? "User info" : isEditMode ? "Edit Group info" : "Group info"} </h4>
                        </div>
                        {!isPrivateTypeChat && !isEditMode && (selectedChat as GroupChat).adminId == user?.id && (
                            <div className="col-2 d-flex pe-0 justify-content-end">
                                <button className="btn btn-secondary " type="button" id="edit" aria-expanded="false" onClick={handleOpenEditChat}>
                                    <FontAwesomeIcon icon={faEdit} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div
                        className="d-flex flex-column align-items-center text-light justify-content-center avatar-container">
                        <div
                            className={`rounded-circle overflow-hidden position-relative avatar-size ${isEditMode ? "pointer" : ""}`}
                            onMouseEnter={() => setHover(true)}
                            onMouseLeave={() => setHover(false)}
                            onClick={isEditMode ? () => document.getElementById("fileInputEditChat")?.click() : undefined}
                        >
                            <img
                                src={AvatarUrl}
                                alt="Chat"
                                className="avatar"
                                style={
                                    isEditMode
                                        ? {
                                            transition: "filter 0.3s ease",
                                            filter: hover ? "brightness(60%)" : "brightness(100%)",
                                        }
                                        : undefined
                                }

                            />
                            {isEditMode && (
                                <div
                                    className="position-absolute top-50 start-50 translate-middle avatar-change-icon"
                                    style={{ fontSize: hover ? "40px" : "32px" }}
                                >
                                    <FontAwesomeIcon icon={faPlus} />
                                </div>
                            )}

                        </div>
                        {isEditMode && (
                            <input
                                type="file"
                                id="fileInputEditChat"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={handleImageChange}
                            />
                        )}

                        <div className="d-flex justify-content-between align-items-start position-relative mt-2">
                            {isChatNameEditing ? (
                                <div className="input-wrapper">
                                    <fieldset className="styled-fieldset">
                                        <legend className="styled-legend">Group name</legend>
                                        <input
                                            type="text"
                                            value={editedChatName}
                                            className="styled-input"
                                            onChange={handleChangeChatName}
                                        />
                                    </fieldset>
                                </div>
                            ) : (
                                <h4 className={`${isEditMode ? "me-3" : ""}`}>
                                    {isPrivateTypeChat ? ChatUser!.userName : (selectedChat as GroupChat).groupName}
                                </h4>
                            )}

                            {!isPrivateTypeChat && isEditMode && (
                                <FontAwesomeIcon
                                    className="position-absolute top-0 end-0 pointer"
                                    fontSize={isChatNameEditing ? "20px" : "15px"}
                                    icon={isChatNameEditing ? faClose : faEdit}
                                    onClick={() => { setIsChatNameEditing(!isChatNameEditing) }}
                                />
                            )}
                        </div>

                        <span className="text-secondary">{isPrivateTypeChat ? "Online" : (selectedChat as GroupChat).userChats.length + " members"}</span>

                        {showModal && (
                            <ChangePhotoModal
                                onCloseModal={() => { setShowModal(false) }}
                                onSubmitPhoto={handleSubmitPhoto}
                                hover={hover}
                                image={image}
                            />
                        )}

                    </div>

                    {isPrivateTypeChat && (
                        <UserInfo User={ChatUser!} />
                    )}

                    {!isPrivateTypeChat && (
                        <GroupMembers
                            Chat={(selectedChat as GroupChat)}
                        />
                    )}

                </div>
                {showButtonSave && (
                    <motion.div className="fab-container"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        <button
                            className="fab chat-hover"
                            aria-label="Floating Action Button"
                            onClick={handleSaveChanges}
                        >
                            <FontAwesomeIcon icon={faCheck} />
                        </button>
                    </motion.div>
                )}
                {!showButtonSave && selectedChat && isGroupChat(selectedChat) && (
                    <AddMembers Chat={selectedChat}></AddMembers>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default ShowChatInfo;