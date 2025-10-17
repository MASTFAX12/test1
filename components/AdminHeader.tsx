import React from 'react';
import { Role } from '../types.ts';
import { EyeIcon, ArrowRightOnRectangleIcon, UserCircleIcon } from './Icons.tsx';

interface AdminHeaderProps {
  role: Role;
  onLogout: () => void;
  onShowPublicView: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ role, onLogout, onShowPublicView }) => {
  const roleText = role === Role.Doctor ? 'الطبيب' : 'السكرتير';

  return (
    <header className="bg-white/80 backdrop-blur-lg p-4 rounded-xl shadow-md mb-6 flex justify-between items-center sticky top-6 z-40 border border-gray-200">
      <div className="flex items-center gap-3">
        <UserCircleIcon className="w-10 h-10 text-blue-500" />
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            لوحة تحكم {roleText}
          </h1>
          <p className="text-sm text-gray-500">مرحباً بك في واجهة إدارة العيادة.</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onShowPublicView}
          className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
          title="عرض شاشة الجمهور"
        >
          <EyeIcon className="w-5 h-5" />
          <span className="hidden md:inline">شاشة الجمهور</span>
        </button>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          title="تسجيل الخروج"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
           <span className="hidden md:inline">خروج</span>
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;