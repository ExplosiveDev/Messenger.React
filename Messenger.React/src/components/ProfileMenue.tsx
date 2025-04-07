import { faAt, faPhone, faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, useContext, useEffect, useRef, useState } from "react";
import User from "../Models/User";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import myFile from "../Models/File";

interface ProfileMenueProps {
    User: User;
}

const ProfileMenue: FC<ProfileMenueProps> = ({ User }) => {
    const [copied, setCopied] = useState<string | null>(null);
    const [image, setImage] = useState<File | null>(null);
    const [hover, setHover] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const auth = useContext(AuthContext);

    useEffect(() => {console.log(User)},[])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && showModal && !modalRef.current.contains(event.target as Node)) {
                setShowModal(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showModal]);

    const formatPhoneNumber = (phone: string) => {
        return phone.replace(/^(\+?38)?(\d{3})(\d{3})(\d{2})(\d{2})$/, "+38 ($2) $3 $4 $5");
    };

    const copyToClipboard = async (text: string, type: "phone" | "username") => {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
            try {
                await navigator.clipboard.writeText(text);
                setCopied(type);
                setTimeout(() => setCopied(null), 2000);
            } catch (err) {
                console.error("Помилка копіювання:", err);
            }
        } else {
            // Старий метод через textarea
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);

            setCopied(type);
            setTimeout(() => setCopied(null), 2000);
        }
    };



    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                const avatar:myFile = response.data.activeAvatar;
                auth.ChangeAvatar(avatar);
            };
            uploadAvatar();
        }
    };

    return (
        <div className="row px-2 mx-2">
            <div
                className="d-flex flex-column align-items-center text-light justify-content-center"
                style={{
                    height: "350px"
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
                        src= {User.activeAvatar.url != null ? User.activeAvatar.url : "http://192.168.0.100:5187/uploads/user.png"} 
                        alt="User"
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "filter 0.3s ease",
                            filter: hover ? "brightness(60%)" : "brightness(100%)",
                        }}
                    />
                    {hover && (
                        <div
                            className="position-absolute top-50 start-50 translate-middle"
                            style={{
                                color: "white",
                                fontSize: "32px",
                                fontWeight: "bold",
                            }}
                        >
                            <FontAwesomeIcon icon={faPlus} />
                        </div>
                    )}
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



            <button className="btn col-12 p-0 mt-2 my-1 chat-hover " onClick={() => copyToClipboard(User.phone, "phone")} >
                <div className="row row-cols py-1 px-3 ">
                    <div className="d-flex col-3 justify-content-center text-light p-0" >
                        <div className="d-flex align-items-center">
                            <FontAwesomeIcon icon={faPhone} fontSize={30} />
                        </div>
                    </div>
                    <div className="d-flex col-9 boreder  justify-content-start text-light">
                        <div className="row">
                            <div className="col-12 d-flex align-items-center">
                                <h4 className="m-0">{formatPhoneNumber(User.phone)}</h4>
                            </div>
                            <div className="col-12 d-flex align-items-center">
                                <h6 className="m-0 text-secondary">Phone</h6>
                                {copied === "phone" && <span className="text-success ms-2">Скопійовано!</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </button>

            <button className="btn col-12 p-0 mt-2 my-1 chat-hover " onClick={() => copyToClipboard(User.userName, "username")}>
                <div className="row row-cols py-1 px-3 ">
                    <div className="d-flex col-3  justify-content-center text-light p-0" >
                        <div className="d-flex align-items-center">
                            <FontAwesomeIcon icon={faAt} fontSize={30} />
                        </div>
                    </div>
                    <div className="d-flex col-9 boreder  justify-content-start text-light">
                        <div className="row">
                            <div className="col-12 d-flex align-items-center">
                                <h4 className="m-0">{User.userName}</h4>
                            </div>
                            <div className="col-12 d-flex align-items-center">
                                <h6 className="m-0 text-secondary">Username</h6>
                                {copied === "username" && <span className="text-success ms-2">Скопійовано!</span>}
                            </div>
                        </div>

                    </div>
                </div>
            </button>
        </div>

    );
};

export default ProfileMenue;