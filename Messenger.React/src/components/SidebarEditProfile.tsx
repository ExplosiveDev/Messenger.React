import { faArrowLeft, faPlus, faTimes, faPhone, faAt, faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "framer-motion";
import { MouseEvent, ChangeEvent, FC, useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import User from "../Models/User";
import myFile from "../Models/File";

import "../assets/styles/EditProfile.css"
import { ChangeUserFields } from "../services/users";

interface SidebarEditProfileProps {
    User: User;
    onLeftEditProfileMode: () => void;
}



const SidebarEditProfile: FC<SidebarEditProfileProps> = ({ User, onLeftEditProfileMode }) => {

    const [editedUserName, setEditedUserName] = useState(User.userName);
    const [image, setImage] = useState<File | null>(null);
    const [hover, setHover] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showButtonSave, setShowButtonSave] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const auth = useContext(AuthContext);

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
                            Authorization: `Bearer ${auth.token}`,
                        },
                    }
                );
                const avatar: myFile = response.data.activeAvatar;
                auth.ChangeAvatar(avatar);
            };
            uploadAvatar();
        }
    };

    const handleSaveChanges = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if(editedUserName){
            const ChangeUserName = async () => {
                const newUserName = await ChangeUserFields(auth.token!, editedUserName)
                auth.ChangeUserName(newUserName);
                
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
                        className="d-flex flex-column align-items-center text-light justify-content-center"
                        style={{
                            height: "300px"
                        }}
                    >
                        <div
                            className="rounded-circle overflow-hidden position-relative"
                            style={{
                                width: "130px",
                                height: "130px",
                                cursor: "pointer",
                            }}
                            onMouseEnter={() => setHover(true)}
                            onMouseLeave={() => setHover(false)}
                            onClick={() => document.getElementById("fileInput")?.click()}
                        >
                            <img
                                src={User.activeAvatar.url != null ? User.activeAvatar.url : "http://192.168.0.100:5187/uploads/user.png"}
                                alt="User"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    transition: "filter 0.3s ease",
                                    filter: hover ? "brightness(60%)" : "brightness(100%)",
                                }}
                            />
                            <div
                                className="position-absolute top-50 start-50 translate-middle"
                                style={{
                                    color: "white",
                                    fontSize: hover ? "40px" : "32px",
                                    transition: "0.3s ease",
                                    fontWeight: "bold",
                                }}
                            >
                                <FontAwesomeIcon icon={faPlus} />
                            </div>
                        </div>
                        <input
                            type="file"
                            id="fileInput"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleImageChange}
                        />
                        <h4 className="mt-2">{User.userName}</h4>
                        <span className="text-secondary">Online</span>

                        {showModal && (
                            <div className="modal-overlay">
                                <div className="modal-content dark-modal" ref={modalRef}>
                                    <div className="modal-header">
                                        <h5 className="modal-title">Фото</h5>
                                        <button
                                            className="close-btn"
                                            onClick={() => setShowModal(false)}
                                        >
                                            <FontAwesomeIcon icon={faTimes} />
                                        </button>
                                    </div>

                                    <div className="modal-body d-flex justify-content-center">
                                        {image && (
                                            <>
                                                <div className="rounded-circle overflow-hidden position-relative image-preview-container"
                                                    style={{
                                                        width: "250px",
                                                        height: "250px",
                                                    }}>
                                                    <img
                                                        src={URL.createObjectURL(image)}
                                                        alt="Preview"
                                                        className="image-preview"
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                            objectFit: "cover",
                                                            transition: "filter 0.3s ease",
                                                            filter: hover ? "brightness(60%)" : "brightness(100%)",
                                                        }}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            className="btn-primary"
                                            onClick={handleSubmitPhoto}
                                        >
                                            Змінити аватар
                                        </button>
                                    </div>
                                </div>
                            </div>
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