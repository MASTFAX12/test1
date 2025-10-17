import React, { useState } from 'react';
import type { ClinicSettings } from '../types.ts';
import { Role } from '../types.ts';

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
      <h2 className="text-3xl font-bold text-center text-white mb-8">اختر دورك للدخول</h2>
      <div className="flex flex-col gap-4">
        <button
          onClick={() => handleRoleSelect(Role.Doctor)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-transform hover:scale-105 w-full text-lg"
        >
          دخول كطبيب
        </button>
        <button
          onClick={() => handleRoleSelect(Role.Secretary)}
          className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-transform hover:scale-105 w-full text-lg"
        >
          دخول كسكرتير
        </button>
         <button
            type="button"
            onClick={onClose}
            className="mt-4 bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition-colors w-full"
        >
            العودة للشاشة الرئيسية
        </button>
      </div>
    </>
  );

  const renderPasswordInput = () => (
    <>
      <h2 className="text-3xl font-bold text-center text-white mb-2">تسجيل دخول</h2>
      <p className="text-center text-blue-200 mb-6">{selectedRole === Role.Doctor ? 'كطبيب' : 'كسكرتير'}</p>
      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label htmlFor="password" className="block text-white/80 text-sm font-bold mb-2">
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
            className="form-input"
            autoFocus
          />
        </div>
        {error && <p className="text-red-400 text-center text-sm -my-2">{error}</p>}
        <div className="flex flex-col gap-4 pt-2">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition-colors w-full"
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
            className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition-colors w-full"
          >
            تغيير الدور
          </button>
        </div>
      </form>
    </>
  );

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex flex-col items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-black/20 backdrop-blur-lg rounded-xl shadow-2xl p-8 w-full max-w-sm mx-auto border border-white/20">
        {step === 'role' ? renderRoleSelection() : renderPasswordInput()}
      </div>
    </div>
  );
};

export default LoginModal;