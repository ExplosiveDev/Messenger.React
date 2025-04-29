import { faArrowLeft, faPlus, faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "framer-motion";
import { MouseEvent, ChangeEvent, FC, useEffect, useRef, useState } from "react";
import axios from "axios";
import User from "../Models/User";
import myFile from "../Models/File";
import { ChangeUserFields } from "../services/users";
import "../assets/styles/EditProfile.css"
import "../assets/styles/MainMenueStyles/Componets.css"
import ChangePhotoModal from "./Modal/ChangePhotoModal";
import { useAppDispatch, useAppSelector } from "../store/store";
import { changeUserAvatar, changeUserName } from "../store/features/userSlice";

interface SidebarEditProfileProps {
    onLeftEditProfileMode: () => void;
}

const SidebarEditProfile: FC<SidebarEditProfileProps> = ({ onLeftEditProfileMode }) => {
    const User = useAppSelector(state => state.user).user!;
    const token = useAppSelector(state => state.user).token;
    const dispatch = useAppDispatch();

    const [editedUserName, setEditedUserName] = useState(User.userName);
    const [image, setImage] = useState<File | null>(null);
    const [hover, setHover] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showButtonSave, setShowButtonSave] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

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

    const handleLeftEditProfileMode = (e: MouseEvent<HTMLElement>) => {
        e.preventDefault();
        onLeftEditProfileMode()
    };

    const handleChangeName = (e: ChangeEvent<HTMLInputElement>) => {
        setEditedUserName(e.target.value)
        if (e.target.value != User.userName) setShowButtonSave(true);
        else setShowButtonSave(false);
    };

    const handleSubmitPhoto = () => {
        if (image) {
            setShowModal(false)
            const uploadAvatar = async () => {
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
                dispatch(changeUserAvatar({newAvatar:avatar}));
            };
            uploadAvatar();
        }
    };

    const handleSaveChanges = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if(editedUserName){
            const ChangeUserName = async () => {
                const newUserName:string = await ChangeUserFields(token!, editedUserName)
                dispatch(changeUserName({newUserName:newUserName}));
            }
            ChangeUserName();
        }
    }

    return (
        <AnimatePresence>
            <motion.div className="col-3 sidebar py-2 ps-0 pe-0 "
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
                <div className="search-bar ps-2 pe-2 d-flex">
                    <div className="row row-cols w-100 mx-0">

                        <div className="col-2 d-flex  pe-0 ">
                            <button className="btn btn-secondary " type="button" id="left" aria-expanded="false" onClick={handleLeftEditProfileMode}>
                                <FontAwesomeIcon icon={faArrowLeft} />
                            </button>
                        </div>

                        <div className="col-8 d-flex  align-items-center px-0">
                            <h4 className="m-0 fw-bold" >Edit Profile </h4>
                        </div>
                    </div>
                </div>
                <div className="row px-2 mx-2">
                    <div
                        className="d-flex flex-column align-items-center text-light justify-content-center avatar-container">
                        <div
                            className="rounded-circle overflow-hidden position-relative avatar-size pointer"
                            onMouseEnter={() => setHover(true)}
                            onMouseLeave={() => setHover(false)}
                            onClick={() => document.getElementById("fileInputEditProfile")?.click()}
                        >
                            <img
                                src={User.activeAvatar.url != null ? User.activeAvatar.url : "http://192.168.0.100:5187/uploads/user.png"}
                                alt="User"
                                className="avatar"
                                style={{
                                    transition: "filter 0.3s ease",
                                    filter: hover ? "brightness(60%)" : "brightness(100%)",
                                }}
                            />
                            <div
                                className="position-absolute top-50 start-50 translate-middle avatar-change-icon"
                                style={{ fontSize: hover ? "40px" : "32px" }}
                            >
                                <FontAwesomeIcon icon={faPlus} />
                            </div>
                        </div>
                        <input
                            type="file"
                            id="fileInputEditProfile"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleImageChange}
                        />
                        <h4 className="mt-2">{User.userName}</h4>
                        <span className="text-secondary">Online</span>

                        {showModal && (
                            <ChangePhotoModal 
                                onCloseModal={() => {setShowModal(false)}}
                                onSubmitPhoto={handleSubmitPhoto}
                                hover={hover}
                                image={image}
                            />
                        )}

                    </div>

                    <hr></hr>

                    <div className="col-12 p-0 mt-2 my-1 " >
                        <div className="input-wrapper">
                            <fieldset className="styled-fieldset">
                                <legend className="styled-legend">Name</legend>
                                <input
                                    type="text"
                                    value={editedUserName}
                                    className="styled-input"
                                    onChange={handleChangeName}
                                />
                            </fieldset>
                        </div>
                    </div>
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
            </motion.div>

        </AnimatePresence>
    );
};

export default SidebarEditProfile;