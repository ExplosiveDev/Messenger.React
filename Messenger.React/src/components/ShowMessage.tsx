import { ChangeEvent, FC, FormEvent, useContext, useEffect, useState } from "react";

import { AuthContext } from "../context/AuthContext";
import Message from "../Models/Message";

interface MessageProps {
    Message: Message;
}

const ShowMessage: FC<MessageProps> = ({ Message }) => {

    const auth = useContext(AuthContext);


    return (
        <>
            {
                auth.user!.id != Message.sender.id ?
                    (
                        <div className="col-12 d-flex">
                            <div className="mt-2 message-box">{Message.content}</div>
                        </div>
                    )
                    :
                    (
                        <div className="col-12 d-flex justify-content-end ">
                            <div className="message-box mt-2 my-message">{Message.content}</div>
                        </div>

                    )
            }
        </>
    )

}

export default ShowMessage
