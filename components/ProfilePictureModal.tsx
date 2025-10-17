import React, { useState, useRef, useEffect } from 'react';
import { UserCircleIcon, XMarkIcon, SpinnerIcon, PlusIcon } from './Icons.tsx';
import type { Role } from '../types.ts';

interface ProfilePictureModalProps {
  onClose: () => void;
  onSave: (file: File) => Promise<void>;
  currentImageUrl?: string;
  role: Role;
}

const ProfilePictureModal: React.FC<ProfilePictureModalProps> = ({ onClose, onSave, currentImageUrl }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setPreviewUrl(currentImageUrl || null);
  }, [selectedFile, currentImageUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSaveClick = async () => {
    if (!selectedFile) return;
    setIsSaving(true);
    await onSave(selectedFile);
    setIsSaving(false);
  };

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">تغيير صورة الملف الشخصي</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </header>
        
        <div className="p-6 flex-grow flex flex-col items-center justify-center">
            <div className="relative w-48 h-48 mb-6">
                {previewUrl ? (
                    <img src={previewUrl} alt="Profile Preview" className="w-full h-full rounded-full object-cover border-4 border-gray-200" />
                ) : (
                    <UserCircleIcon className="w-full h-full text-gray-300" />
                )}
                <button 
                    onClick={handleTriggerFileInput} 
                    className="absolute bottom-2 right-2 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition"
                    title="اختر صورة جديدة"
                >
                    <PlusIcon className="w-5 h-5"/>
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/png, image/jpeg"
                />
            </div>
             <p className="text-sm text-gray-500 text-center">اختر صورة مربعة للحصول على أفضل النتائج.</p>
        </div>
        
        <footer className="p-4 border-t bg-gray-50 rounded-b-2xl flex justify-end gap-3">
            <button
                type="button"
                onClick={onClose}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors"
            >
                إلغاء
            </button>
            <button
                onClick={handleSaveClick}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={!selectedFile || isSaving}
            >
                {isSaving ? <SpinnerIcon className="w-5 h-5"/> : null}
                {isSaving ? 'جاري الحفظ...' : 'حفظ الصورة'}
            </button>
        </footer>
      </div>
    </div>
  );
};

export default ProfilePictureModal;