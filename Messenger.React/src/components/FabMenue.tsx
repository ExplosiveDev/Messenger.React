import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTimes, faUsers, faCommentDots, faBullhorn } from "@fortawesome/free-solid-svg-icons";
import "../assets/styles/MainMenueStyles/FabMenue.css"

const FabMenu: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

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
                    <button onClick={() => alert("New Channel")}>
                        <FontAwesomeIcon icon={faBullhorn} />
                        New Channel
                    </button>
                    <button onClick={() => alert("New Group")}>
                        <FontAwesomeIcon icon={faUsers} />
                        New Group
                    </button>
                    <button onClick={() => alert("New Private Chat")}>
                        <FontAwesomeIcon icon={faCommentDots} />
                        New Private Chat
                    </button>
                </div>
            )}
        </div>
    );
};

export default FabMenu;
