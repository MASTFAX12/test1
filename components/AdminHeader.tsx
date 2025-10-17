
import React from 'react';
import { Role } from '../types.ts';
import { EyeIcon, ArrowRightOnRectangleIcon, UserCircleIcon, QuestionMarkCircleIcon, Cog8ToothIcon } from './Icons.tsx';

interface AdminHeaderProps {
  role: Role;
  onLogout: () => void;
  onShowPublicView: () => void;
  onOpenProfileModal: () => void;
  onOpenHelpModal: () => void;
  onOpenSettingsModal: () => void;
  profilePicUrl?: string;
  clinicName: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ role, onLogout, onShowPublicView, onOpenProfileModal, onOpenHelpModal, onOpenSettingsModal, profilePicUrl }) => {
  const roleText = role === Role.Doctor ? 'الطبيب' : 'السكرتير';

  return (
    <header className="px-6 py-4 flex-shrink-0 flex justify-between items-center bg-white border-b border-gray-200">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            لوحة التحكم
          </h1>
          <p className="text-sm text-gray-500">الدور الحالي: {roleText}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
         {role === Role.Doctor && (
             <button
                onClick={onOpenSettingsModal}
                className="p-2.5 bg-white hover:bg-gray-200/60 border border-gray-200 text-gray-700 rounded-lg transition-colors"
                title="الإعدادات"
             >
                <Cog8ToothIcon className="w-5 h-5" />
            </button>
         )}
        <button
          onClick={onShowPublicView}
          className="flex items-center gap-2 bg-white hover:bg-gray-200/60 border border-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
          title="عرض شاشة الجمهور"
        >
          <EyeIcon className="w-5 h-5" />
          <span className="hidden md:inline">شاشة الجمهور</span>
        </button>
        <button
          onClick={onOpenHelpModal}
          className="p-2.5 bg-white hover:bg-gray-200/60 border border-gray-200 text-gray-700 rounded-lg transition-colors"
          title="تعليمات الاستخدام"
        >
          <QuestionMarkCircleIcon className="w-5 h-5" />
        </button>
        <button
          onClick={onLogout}
          className="p-2.5 bg-white hover:bg-gray-200/60 border border-gray-200 text-red-500 rounded-lg transition-colors"
          title="تسجيل الخروج"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
        </button>
        <button
          onClick={onOpenProfileModal}
          className="w-11 h-11 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors ml-2"
          title="تغيير صورة الملف الشخصي"
        >
          {profilePicUrl ? (
            <img src={profilePicUrl} alt="Profile" className="w-full h-full rounded-full object-cover ring-2 ring-white"/>
          ) : (
            <UserCircleIcon className="w-8 h-8 text-gray-500" />
          )}
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
