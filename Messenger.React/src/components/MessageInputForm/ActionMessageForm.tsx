import { FC } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { faEdit, faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { closeAction } from "../../store/features/actionMessageSlice";
import TextMessage from "../../Models/TextMessage";
import "../../assets/styles/Action.css"

const ActionMessageForm: FC = () => {
    const { actions, actionType, actionMessage } = useAppSelector(state => state.actionMessage);
    const dispatch = useAppDispatch();

    
    return (
        <>
            {actionMessage &&
                <div className="action-preview d-flex justify-content-between align-items-start p-2 rounded">
                    <div className="d-flex flex-column w-100">
                        <div className="d-flex align-items-center">
                            <FontAwesomeIcon color="white" fontSize={20} icon={faEdit} />
                            <div className="action-line bg-primary mx-2" style={{ width: "3px", height: "40px" }}></div>
                            <div className="flex-grow-1">
                                <div className="action fw-bold" style={{ fontSize: "0.85rem" }}>
                                    {actionType}
                                </div>
                                <div className="action-message">
                                    { (actionMessage as TextMessage).content }
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="btn align-self-start"
                        onClick={() => dispatch(closeAction())}
                    >
                        <FontAwesomeIcon color="white" icon={faClose} />
                    </button>
                </div>
            }
        </>

    )
};

export default ActionMessageForm;