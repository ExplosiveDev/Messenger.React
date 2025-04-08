import { FC,MouseEvent, useContext, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTimes, faUsers, faCommentDots, faBullhorn } from "@fortawesome/free-solid-svg-icons";
import "../assets/styles/MainMenueStyles/FabMenue.css"
import User from "../Models/User";
import { AuthContext } from "../context/AuthContext";
import { getContacts } from "../services/users";

const FabMenu: FC = () => {
    const auth = useContext(AuthContext);

    const [isOpen, setIsOpen] = useState(false);

    const handleCreateGroup = async (e: MouseEvent<HTMLButtonElement>) => {
        const Contacts: User[] = await getContacts(auth.token!);
        console.log(Contacts);
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
                <div className="fab-menu">
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
        </div>
    );
};

export default FabMenu;
