import { useState, useRef, useEffect, FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip, faTimes } from '@fortawesome/free-solid-svg-icons';

import "../../assets/styles/Modal.css"

interface FilePickerDropupProps {
  onFileSelect?: (file: File) => void;
  onPhotoSelect?: (photo: File, caption?: string) => void;
}

const FilePicker:FC<FilePickerDropupProps> = ({ onFileSelect, onPhotoSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [caption, setCaption] = useState('');
  const dropupRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Закриваємо дропап при кліку поза ним
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropupRef.current && !dropupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (modalRef.current && showModal && !modalRef.current.contains(event.target as Node)) {
        setShowModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showModal]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onFileSelect?.(e.target.files[0]);
      e.target.value = '';
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedPhoto(e.target.files[0]);
      setShowModal(true);
      e.target.value = '';
    }
  };

  const handleSubmitPhoto = () => {
    if (selectedPhoto) {
      onPhotoSelect?.(selectedPhoto, caption);
      setShowModal(false);
      setCaption('');
      setSelectedPhoto(null);
    }
  };

  return (
    <>
      <div className="dropup position-relative" ref={dropupRef}>
        <button
          type="button"
          className="btn p-2 text-light"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
        >
          <FontAwesomeIcon icon={faPaperclip} className="text-light" size="lg" />
        </button>

        <div 
          className={`dropdown-menu dropdown-menu-dark bg-dark ${isOpen ? 'show' : ''}`}
          style={{ 
            minWidth: '120px', 
            border: '1px solid #444',
            position: 'absolute',
            bottom: '100%',
            marginBottom: '0.5rem'
          }}
        >
          <input
            type="file"
            id="fileInput"
            className="d-none"
            onChange={handleFileChange}
          />
          <label htmlFor="fileInput" className="dropdown-item text-light hover-bg-dark cursor-pointer">
            File
          </label>

          <input
            type="file"
            id="photoInput"
            className="d-none"
            accept="image/*"
            onChange={handlePhotoChange}
          />
          <label htmlFor="photoInput" className="dropdown-item text-light hover-bg-dark cursor-pointer">
            Photo
          </label>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content dark-modal" ref={modalRef}>
            <div className="modal-header">
              <h5 className="modal-title">Додати опис до фото</h5>
              <button 
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="modal-body">
              {selectedPhoto && (
                <>
                  <div className="image-preview-container">
                    <img 
                      src={URL.createObjectURL(selectedPhoto)} 
                      alt="Preview" 
                      className="image-preview"
                    />
                  </div>
                  <textarea
                    placeholder="Введіть опис до фото..."
                    className="caption-input"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={3}
                  />
                </>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Скасувати
              </button>
              <button 
                className="btn-primary"
                onClick={handleSubmitPhoto}
              >
                Надіслати
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilePicker;