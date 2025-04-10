import { FC, useContext } from "react";
import Chat from "../Models/Chat";
import { faPlus, faPhone, faAt, faArrowLeft, faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useIndexedDBMessenger from "../hooks/indexedDbMessenger.hook";
import { AuthContext } from "../context/AuthContext";
import User from "../Models/User";
import GroupChat from "../Models/GroupChat";
import UserChat from "../Models/UserChat";

interface ShowChatInfoProps {
    selectedChat: Chat;
    onCloseChatInfo?: () => void;
}

const ShowChatInfo: FC<ShowChatInfoProps> = ({ selectedChat, onCloseChatInfo }) => {
    const auth = useContext(AuthContext);
    const { isPrivateChat, isGroupChat } = useIndexedDBMessenger();

    let isPrivateTypeChat!: boolean;
    let AvatarUrl: string = "";
    //if is private chat
    let ChatUser: User;


    if (isPrivateChat(selectedChat)) {
        const user1 = selectedChat.user1;
        const user2 = selectedChat.user2;
        const chatUser = user1.id === auth.user?.id ? user2 : user1;
        isPrivateTypeChat = true;
        AvatarUrl = chatUser.activeAvatar.url ? chatUser.activeAvatar.url : "http://192.168.0.100:5187/uploads/user.png";
        ChatUser = chatUser;
    }
    if (isGroupChat(selectedChat)) {
        isPrivateTypeChat = false;
        AvatarUrl = selectedChat.activeIcon.url ? selectedChat.activeIcon.url : "http://192.168.0.100:5187/uploads/groups.png";
    }

    const formatPhoneNumber = (phone: string) => {
        return phone.replace(/^(\+?38)?(\d{3})(\d{3})(\d{2})(\d{2})$/, "+38 ($2) $3 $4 $5");
    };

    const handleCloseChatInformation = () => onCloseChatInfo?.();

    return (
        <div className="row px-2 mx-2 " >
            <div className="col-12 d-flex align-items-center px-0" >
                <button className="btn btn-secondary me-3" type="button" id="left" aria-expanded="false" onClick={handleCloseChatInformation} >
                    <FontAwesomeIcon icon={faClose} />
                </button>
                <h4 className="m-0 fw-bold">{isPrivateTypeChat ? "User info" : "Group info"} </h4>
            </div>

            <div
                className="d-flex flex-column align-items-center text-light justify-content-center"
                style={{
                    height: "300px"
                }}
            >

                <div
                    className="rounded-circle overflow-hidden position-relative"
                    style={{
                        width: "160px",
                        height: "160px",

                    }}>

                    <img
                        src={AvatarUrl}
                        alt="User"
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "filter 0.3s ease",
                        }}
                    />
                </div>
                <h4 className="mt-2">{isPrivateTypeChat ? ChatUser!.userName : (selectedChat as GroupChat).groupName}</h4>
                <span className="text-secondary">{isPrivateTypeChat ? "Online" : (selectedChat as GroupChat).userChats.length + " members"}</span>
            </div>


            {isPrivateTypeChat && (
                <>
                    <hr></hr>
                    <button className="btn col-12 p-0 mt-2 my-1 chat-hover ">
                        <div className="row row-cols py-1 px-3 ">
                            <div className="d-flex col-3 justify-content-center text-light p-0" >
                                <div className="d-flex align-items-center">
                                    <FontAwesomeIcon icon={faPhone} fontSize={30} />
                                </div>
                            </div>
                            <div className="d-flex col-9 boreder  justify-content-start text-light">
                                <div className="row">
                                    <div className="col-12 d-flex align-items-center">
                                        <h4 className="m-0">{formatPhoneNumber(ChatUser! ? ChatUser.phone : "+38**********")}</h4>
                                    </div>
                                    <div className="col-12 d-flex align-items-center">
                                        <h6 className="m-0 text-secondary">Phone</h6>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </button>
                    <button className="btn col-12 p-0 mt-2 my-1 chat-hover " >
                        <div className="row row-cols py-1 px-3 ">
                            <div className="d-flex col-3  justify-content-center text-light p-0" >
                                <div className="d-flex align-items-center">
                                    <FontAwesomeIcon icon={faAt} fontSize={30} />
                                </div>
                            </div>
                            <div className="d-flex col-9 boreder  justify-content-start text-light">
                                <div className="row">
                                    <div className="col-12 d-flex align-items-center">
                                        <h4 className="m-0">{ChatUser! ? ChatUser.userName : "User"}</h4>
                                    </div>
                                    <div className="col-12 d-flex align-items-center">
                                        <h6 className="m-0 text-secondary">Username</h6>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </button>
                </>
            )}

            {!isPrivateTypeChat && (
                <div className="d-flex flex-column m-0">
                    <hr></hr>
                    <h4 className="m-0 text-center text-secondary">Members</h4>
                    {(selectedChat as GroupChat).userChats.map((userChat: UserChat) => (
                        <div className="col-12 my-1 px-2">
                            <button className="btn w-100 chat-hover position-relative d-flex align-items-center" type="button">
                                <img className="chat-photo me-2" src={userChat.user.activeAvatar.url} alt="Chat" />

                                <div className="d-flex flex-column text-start">
                                    <h3 className="chat-name m-0 text-light">{userChat.user.userName}</h3>                              
                                </div>
                            </button>

                        </div>
                    ))}
                </div>
            )}

        </div>

    );
};

export default ShowChatInfo;