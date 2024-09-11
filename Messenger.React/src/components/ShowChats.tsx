import React, { FC, MouseEvent, useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import User from "../Models/User";
import '../assets/styles/modalWindow/Modal.css'

interface ChatProps {
  Chat: User;
}

const ShowChats: FC<ChatProps> = ({ Chat }) => {
  const auth = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);

  const selectChat = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    auth.setSelectedChat(Chat);
    setShowModal(true);
  };

  const handleButtonClick = (value: string) => {
    console.log(`Button clicked: ${value}`);
    setShowModal(false);
  };

  return (
    <div className="col-12 mt-2 text-center">
      <button
        className="chat-hover btn btn-outline-secondary w-100"
        type="button"
        onClick={selectChat}
      >
        <h3 className="chat-name m-0">{Chat.userName}</h3>
      </button>

      {showModal && (
        // <div className="modal fade show d-block" id="chatModal" tabIndex={-1} role="dialog" aria-labelledby="chatModalLabel" aria-hidden="true">
        //   <div className="modal-dialog" role="document">
        //     <div className="modal-content">
        //       <div className="modal-header">
        //         <h5 className="modal-title" id="chatModalLabel">Chat with {Chat.userName}</h5>
        //         <button type="button" className="btn-close" data-bs-dismiss="modal" onClick={() => handleButtonClick('close')} aria-label="Close"></button>
        //       </div>
        //       <div className="modal-body">
        //         <p className="m-0 p-0">Ви впевнені, хочете створити чат з {Chat.userName}.</p>
        //       </div>
        //       <div className="d-flex justify-content-center modal-footer">
        //         <button type="button" className="btn btn-outline-danger me-2" onClick={() => handleButtonClick('No')}>No</button>
        //         <button type="button" className="btn btn-outline-success ms-2" onClick={() => handleButtonClick('Yes')}>Yes</button>
        //       </div>
        //     </div>
        //   </div>
        // </div>

        <div className="modal" tabIndex={-1}>
  <div className="modal-dialog">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">Modal title</h5>
        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div className="modal-body">
        <p>Modal body text goes here.</p>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" className="btn btn-primary">Save changes</button>
      </div>
    </div>
  </div>
</div>
      )}
    </div>
  );
};

export default ShowChats;
