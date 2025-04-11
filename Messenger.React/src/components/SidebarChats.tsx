import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChangeEvent, FC, MouseEvent } from "react";
import ChatMenu from "./ChatMenue";
import FabMenu from "./FabMenue";
import SearchChats from "./SearchChats";
import ShowChats from "./ShowChats";
import Chat from "../Models/Chat";

interface SidebarChatsProps {
    showSavedChats: boolean,
    showSearchedChats: boolean,
    isGlobalSearch:boolean,
    searchChatName: string,
    searchedChats: Chat[],
    savedChats: Chat[],
    handleSearchChange: (e: ChangeEvent<HTMLInputElement>) => void,
    onProfileSelect: () => void,
    handleLeftSearchMode: (e: MouseEvent<HTMLButtonElement>) => void,
}

const SidebarChats: FC<SidebarChatsProps> = ({
    showSavedChats, showSearchedChats, searchChatName, isGlobalSearch, searchedChats, savedChats,
    onProfileSelect, handleLeftSearchMode, handleSearchChange }) => {
    return (
        <div className="col-3 sidebar py-2 ps-0 pe-0 ">
            <div className="search-bar ps-2 pe-2 d-flex">
                <div className="row row-cols w-100 mx-0">
                    <div className="col-2 d-flex  pe-0 ">
                        {showSavedChats && (
                            <ChatMenu onProfileSelect={onProfileSelect} />
                        )}
                        {showSearchedChats && (
                            <button className="btn btn-secondary " type="button" id="left" aria-expanded="false" onClick={handleLeftSearchMode}>
                                <FontAwesomeIcon icon={faArrowLeft} />
                            </button>
                        )}
                    </div>
                </div>
                <div className="col-10 d-flex justify-content-start px-0">
                    <input type="text" className="form-control mb-1 w-100" placeholder="Search" value={searchChatName} onChange={handleSearchChange} />
                </div>
            </div>
            {
                showSavedChats && (
                    <>
                        <ShowChats
                            Chats={savedChats}
                            key={"savedChats"}
                        />
                        
                        <FabMenu />
                    </>
                )
            }

            {
                showSearchedChats && (
                    <SearchChats
                        Chats={searchedChats}
                        isGlobalSearch={isGlobalSearch}
                        key={"searchedChats"}
                    />
                )
            }
        </div>
    );
};


export default SidebarChats;