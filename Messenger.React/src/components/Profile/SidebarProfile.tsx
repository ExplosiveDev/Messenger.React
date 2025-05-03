import { faArrowLeft,faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MouseEvent, FC} from "react";
import { AnimatePresence, motion } from "framer-motion";
import "../../assets/styles/MainMenueStyles/Componets.css"
import UserInfo from "../ChatInformation/UserInfo";
import { useAppSelector } from "../../store/store";

interface SidebarProfileProps {
    handleLeftProfileMode: (e: MouseEvent<HTMLButtonElement>) => void,
    handleEditProfileMode: (e: MouseEvent<HTMLButtonElement>) => void
}

const SidebarProfile: FC<SidebarProfileProps> = ({ handleLeftProfileMode, handleEditProfileMode }) => {
    const User = useAppSelector(state => state.user).user!;
    
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
                        className="d-flex flex-column align-items-center text-light justify-content-center avatar-container">
                        <div
                            className="rounded-circle overflow-hidden position-relative avatar-size">
                            <img
                                src={User.activeAvatar.url != null ? User.activeAvatar.url : "http://192.168.0.100:5187/uploads/user.png"}
                                alt="User"
                                className="avatar"
                            />
                        </div>
                        <h4 className="mt-2">{User.userName}</h4>
                        <span className="text-secondary">Online</span>
                    </div>
                    <UserInfo User={User} />
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SidebarProfile;