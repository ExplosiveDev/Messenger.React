import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, useEffect, useRef } from "react";

interface ChangePhotoModalProps{
    onCloseModal: () => void;
    onSubmitPhoto: () => void;
    image:File | null;
    hover:boolean;
}

const ChangePhotoModal: FC<ChangePhotoModalProps> = ({onCloseModal, onSubmitPhoto, image, hover}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: globalThis.MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onCloseModal();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="modal-overlay">
            <div className="modal-content dark-modal" ref={modalRef}>
                <div className="modal-header">
                    <h5 className="modal-title">Фото</h5>
                    <button
                        className="close-btn"
                        onClick={() => onCloseModal()}
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <div className="modal-body d-flex justify-content-center">
                    {image && (
                        <>
                            <div className="rounded-circle overflow-hidden position-relative image-preview-container modal-image-size">
                                <img
                                    src={URL.createObjectURL(image)}
                                    alt="Preview"
                                    className="image-preview avatar"
                                    style={{
                                        transition: "filter 0.3s ease",
                                        filter: hover ? "brightness(60%)" : "brightness(100%)",
                                    }}
                                />
                            </div>
                        </>
                    )}
                </div>
                <div className="modal-footer">
                    <button
                        className="btn-primary"
                        onClick={() => onSubmitPhoto()}
                    >
                        Змінити фото
                    </button>
                </div>
            </div>
        </div>
    )
};

export default ChangePhotoModal;