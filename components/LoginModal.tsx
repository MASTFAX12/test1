import React, { useState } from 'react';
import type { ClinicSettings } from '../types.ts';
import { Role } from '../types.ts';
import { AcademicCapIcon, UserIcon } from './Icons.tsx';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: (role: Role) => void;
  settings: ClinicSettings;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLoginSuccess, settings }) => {
  const [step, setStep] = useState<'role' | 'password'>('role');
  const [selectedRole, setSelectedRole] = useState<Role>(Role.None);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setStep('password');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    let correctPassword = '';
    
    if (selectedRole === Role.Doctor) {
      correctPassword = settings.doctorPassword || 'doctor123';
    } else if (selectedRole === Role.Secretary) {
      correctPassword = settings.secretaryPassword || 'sec123';
    }

    if (password === correctPassword) {
      onLoginSuccess(selectedRole);
    } else {
      setError('كلمة المرور غير صحيحة');
      setPassword('');
    }
  };

  const renderRoleSelection = () => (
    <>
      <h2 className="text-3xl font-bold text-center text-white mb-2">اختر دورك</h2>
      <p className="text-center text-slate-400 mb-8">للوصول إلى لوحة التحكم</p>
      <div className="flex flex-col gap-4">
        <button
          onClick={() => handleRoleSelect(Role.Doctor)}
          className="group flex items-center justify-center gap-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-white font-bold py-4 px-4 rounded-xl focus:outline-none focus:ring-2 ring-offset-2 ring-offset-slate-800 ring-blue-500 transition-all duration-200 hover:scale-105 w-full text-lg"
        >
          <AcademicCapIcon className="w-6 h-6 text-blue-400 group-hover:text-white transition-colors"/>
          <span>دخول كطبيب</span>
        </button>
        <button
          onClick={() => handleRoleSelect(Role.Secretary)}
          className="group flex items-center justify-center gap-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-white font-bold py-4 px-4 rounded-xl focus:outline-none focus:ring-2 ring-offset-2 ring-offset-slate-800 ring-purple-500 transition-all duration-200 hover:scale-105 w-full text-lg"
        >
          <UserIcon className="w-6 h-6 text-purple-400 group-hover:text-white transition-colors"/>
          <span>دخول كسكرتير</span>
        </button>
         <button
            type="button"
            onClick={onClose}
            className="mt-4 text-slate-400 hover:text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors w-full"
        >
            العودة للشاشة الرئيسية
        </button>
      </div>
    </>
  );

  const renderPasswordInput = () => (
    <>
      <h2 className="text-3xl font-bold text-center text-white mb-2 drop-shadow-md">تسجيل دخول</h2>
      <p className="text-center text-slate-300 mb-8">{selectedRole === Role.Doctor ? 'كطبيب' : 'كسكرتير'}</p>
      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label htmlFor="password" className="block text-slate-300 text-sm font-medium mb-2">
            كلمة المرور
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            className="block w-full px-4 py-2.5 bg-slate-700 text-white border-2 border-slate-600 rounded-lg shadow-sm transition-all duration-200 ease-in-out focus:ring-2 focus:ring-opacity-50 focus:border-[var(--theme-color)] focus:ring-[var(--theme-color)]"
            autoFocus
          />
        </div>
        {error && <p className="text-red-400 text-center text-sm -my-2">{error}</p>}
        <div className="flex flex-col gap-3 pt-2">
          <button
            type="submit"
            style={{ backgroundColor: 'var(--theme-color)' }}
            className="text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-opacity hover:opacity-90 shadow-lg w-full"
          >
            دخول
          </button>
          <button
            type="button"
            onClick={() => {
              setStep('role');
              setPassword('');
              setError('');
            }}
            className="bg-transparent hover:bg-slate-700/50 border-2 border-slate-600 text-slate-300 hover:text-white font-bold py-2.5 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors w-full"
          >
            تغيير الدور
          </button>
        </div>
      </form>
    </>
  );

  return (
    <div className="fixed inset-0 bg-[#111827]/80 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-slate-800/80 rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-auto border border-slate-700">
        {step === 'role' ? renderRoleSelection() : renderPasswordInput()}
      </div>
    </div>
  );
};

export default LoginModal;