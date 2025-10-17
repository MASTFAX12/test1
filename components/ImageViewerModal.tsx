import React from 'react';
import { XMarkIcon } from './Icons.tsx';

interface ImageViewerModalProps {
  imageUrl: string;
  onClose: () => void;
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ imageUrl, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 text-white bg-black/30 p-2 rounded-full hover:bg-black/50 transition-colors"
        aria-label="Close image viewer"
      >
        <XMarkIcon className="w-8 h-8" />
      </button>
      <div 
        className="max-w-[90vw] max-h-[90vh] flex"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image itself
      >
        <img 
          src={imageUrl} 
          alt="Full size view" 
          className="object-contain w-auto h-auto"
        />
      </div>
    </div>
  );
};

export default ImageViewerModal;