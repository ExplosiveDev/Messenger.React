import { FC, useState } from "react";
import User from "../../Models/User";
import { faPhone, faAt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface UserInfoProps {
    User: User;
}

const UserInfo: FC<UserInfoProps> = ({ User }) => {
    const [copied, setCopied] = useState<string | null>(null);

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
        <div>
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
    )
};

export default UserInfo;