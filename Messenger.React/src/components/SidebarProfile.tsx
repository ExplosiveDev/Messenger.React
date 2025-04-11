import { faArrowLeft, faAt, faEdit, faPhone,} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MouseEvent, FC, useContext, useState } from "react";
import User from "../Models/User";
import { AuthContext } from "../context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";

interface SidebarProfileProps {
    User: User;
    handleLeftProfileMode: (e: MouseEvent<HTMLButtonElement>) => void,
    handleEditProfileMode: (e: MouseEvent<HTMLButtonElement>) => void
}

const SidebarProfile: FC<SidebarProfileProps> = ({ User, handleLeftProfileMode, handleEditProfileMode }) => {
    const [copied, setCopied] = useState<string | null>(null);
    const auth = useContext(AuthContext);


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
                            <button className="btn btn-secondary " type="button" id="left" aria-expanded="false" onClick={handleLeftProfileMode}>
                                <FontAwesomeIcon icon={faArrowLeft} />
                            </button>
                        </div>

                        <div className="col-8 d-flex  align-items-center px-0">
                            <h4 className="m-0 fw-bold" >Profile </h4>
                        </div>
                        <div className="col-2 d-flex  pe-0 ">
                            <button className="btn btn-secondary " type="button" id="edit" aria-expanded="false" onClick={handleEditProfileMode}>
                                <FontAwesomeIcon icon={faEdit} />
                            </button>
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
                            }}                         
                        >
                            <img
                                src={User.activeAvatar.url != null ? User.activeAvatar.url : "http://192.168.0.100:5187/uploads/user.png"}
                                alt="User"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    transition: "filter 0.3s ease",
                                }}
                            />                         
                        </div>                  
                        <h4 className="mt-2">{User.userName}</h4>
                        <span className="text-secondary">Online</span>             
                    </div>


                    <hr></hr>
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
            </motion.div>
        </AnimatePresence>
    );
};

export default SidebarProfile;