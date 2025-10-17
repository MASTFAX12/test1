
import React from 'react';
import {
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ChatBubbleOvalLeftEllipsisIcon,
} from './Icons.tsx';

interface AdminSidebarProps {
  activeView: string;
  onNavigate: (view: 'queue' | 'stats' | 'chat') => void;
  clinicName: string;
}

const NavButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 text-right px-3 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
        isActive
          ? 'bg-[var(--theme-color)] text-white shadow'
          : 'text-gray-600 hover:bg-gray-200/60 hover:text-gray-900'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeView, onNavigate, clinicName }) => {
  return (
    <aside className="w-64 flex-shrink-0 bg-gray-50 p-4 border-l border-gray-200 flex flex-col">
      <header className="flex items-center gap-3 p-2 mb-6">
        <div className="w-12 h-12 bg-[var(--theme-color)] rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-sm flex-shrink-0">
          {clinicName.charAt(0)}
        </div>
        <div>
          <h2 className="font-bold text-gray-800 leading-tight">{clinicName}</h2>
          <p className="text-xs text-gray-500">لوحة التحكم</p>
        </div>
      </header>
      <nav className="flex flex-col gap-2">
        <NavButton
          label="إدارة الطابور"
          icon={<ClipboardDocumentListIcon className="w-5 h-5" />}
          isActive={activeView === 'queue'}
          onClick={() => onNavigate('queue')}
        />
        <NavButton
          label="الإحصائيات"
          icon={<ChartBarIcon className="w-5 h-5" />}
          isActive={activeView === 'stats'}
          onClick={() => onNavigate('stats')}
        />
        <NavButton
          label="الدردشة"
          icon={<ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5" />}
          isActive={activeView === 'chat'}
          onClick={() => onNavigate('chat')}
        />
      </nav>
    </aside>
  );
};

export default AdminSidebar;
