import React from 'react';
import { XMarkIcon, TrashIcon, ArchiveBoxIcon } from './Icons.tsx';

interface ConfirmationModalProps {
  title: string;
  message: string;
  onClose: () => void;
  onConfirmDelete: () => void;
  onConfirmArchive: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  message,
  onClose,
  onConfirmDelete,
  onConfirmArchive,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </header>
        
        <div className="p-6 flex-grow">
          <p className="text-gray-600 text-center text-lg">{message}</p>
        </div>
        
        <footer className="p-4 bg-gray-50 rounded-b-2xl flex flex-col sm:flex-row justify-center gap-3">
            <button
                onClick={onClose}
                className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2.5 px-6 rounded-lg transition-colors order-3 sm:order-1"
            >
                إلغاء
            </button>
            <button
                onClick={onConfirmArchive}
                className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 order-2"
            >
                <ArchiveBoxIcon className="w-5 h-5" />
                إرسال للأرشيف
            </button>
             <button
                onClick={onConfirmDelete}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 order-1 sm:order-3"
            >
                <TrashIcon className="w-5 h-5" />
                حذف نهائي
            </button>
        </footer>
      </div>
    </div>
  );
};

export default ConfirmationModal;
