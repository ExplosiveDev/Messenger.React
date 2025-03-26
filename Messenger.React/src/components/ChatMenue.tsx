import { FC, useState, useRef, useEffect, useCallback, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../context/AuthContext";

const ChatMenu: FC = () => {
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
            !buttonRef.current.contains(event.target as Node) // Враховуємо кнопку
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
            const menuRect = menu.getBoundingClientRect();
            const buttonRect = button.getBoundingClientRect();

            let top = buttonRect.bottom + window.scrollY;
            let left = buttonRect.left + window.scrollX;

            // Перевіряємо вихід за межі екрану
            if (menuRect.width + buttonRect.left > window.innerWidth) {
                left = window.innerWidth - menuRect.width - 10;
            }

            if (menuRect.height + buttonRect.bottom > window.innerHeight) {
                top = buttonRect.top - menuRect.height + window.scrollY;
            }

            menu.style.left = `${left}px`;
            menu.style.top = `${top}px`;
        }
    }, [isMenuOpen]);
    const handleExit = async () => {
        auth.logout();
    };

    return (
        <div className="position-relative">
            {/* Кнопка відкриття меню */}
            <button
                ref={buttonRef}
                className="btn btn-dark text-light"
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
            >
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>

            {/* Меню виходу */}
            {isMenuOpen && (
                <div 
                    ref={menuRef}
                    className="bg-dark border rounded p-1"
                    style={{
                        position: "absolute",
                        minWidth: "150px",
                        zIndex: 1000,
                    }}
                >
                    <ul className="list-unstyled mb-0">
                        <li>
                            <button className="btn text-light w-100 d-flex align-items-center" onClick={handleExit}>
                                <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                                Exit
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ChatMenu;
