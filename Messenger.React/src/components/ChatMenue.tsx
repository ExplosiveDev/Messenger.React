import { FC, useState, useRef, useEffect, useCallback, useContext, MouseEventHandler } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV, faSignOutAlt, faUser } from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../context/AuthContext";
import "../assets/styles/MainMenueStyles/ChatMenue.css"

interface ChatMenuProps {
    onProfileSelect: (isSelected: boolean) => void;
}

const ChatMenu: FC<ChatMenuProps> = ({ onProfileSelect }) => {
    const auth = useContext(AuthContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Функція для закриття меню при кліку поза ним
    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (
            menuRef.current &&
            !menuRef.current.contains(event.target as Node) &&
            buttonRef.current &&
            !buttonRef.current.contains(event.target as Node)
        ) {
            setIsMenuOpen(false);
        }
    }, []);

    useEffect(() => {
        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMenuOpen, handleClickOutside]);

    useEffect(() => {
        if (isMenuOpen && menuRef.current && buttonRef.current) {
            const menu = menuRef.current;
            const button = buttonRef.current;
            const buttonRect = button.getBoundingClientRect();
    
            const container = document.querySelector("#profile-container");
    
            if (container) {
                const containerRect = container.getBoundingClientRect();
    
                menu.style.position = "absolute";
                menu.style.top = `${buttonRect.bottom - containerRect.top}px`;
                menu.style.left = `${buttonRect.left - containerRect.left}px`;
                menu.style.transform = "translateY(5px)";
                menu.style.zIndex = "1000";
            }
        }
    }, [isMenuOpen]);


    const handleExit = async () => {
        auth.logout();
    };

    const handleProfileClick = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        onProfileSelect(true);
        setIsMenuOpen(false);
    };

    return (
        <div className="position-relative">
    <button
        ref={buttonRef}
        className="btn btn-secondary text-light"
        type="button"
        onClick={() => setIsMenuOpen((prev) => !prev)}
    >
        <FontAwesomeIcon icon={faEllipsisV} />
    </button>

    {isMenuOpen && (
        <div
            ref={menuRef}
            className="profile-container"
        >
            <div className="profile-menu">
                <button  onClick={handleProfileClick}>
                    <FontAwesomeIcon icon={faUser} className="me-2" />
                    {auth.user?.userName}
                </button>
                <button onClick={handleExit}>
                    <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                    Exit
                </button>
            </div>
        </div>
    )}
</div>

    );
};

export default ChatMenu;
