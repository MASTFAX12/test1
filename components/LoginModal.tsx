import React, { useState } from 'react';
import { ADMIN_PASSWORD } from '../constants.ts';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onLoginSuccess();
    } else {
      setError('كلمة المرور غير صحيحة');
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex flex-col items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-black/20 backdrop-blur-lg rounded-xl shadow-2xl p-8 w-full max-w-sm mx-auto border border-white/20">
        <h2 className="text-3xl font-bold text-center text-white mb-8">تسجيل دخول المسؤول</h2>
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
              className="shadow-inner appearance-none border border-white/20 bg-white/10 rounded w-full py-3 px-4 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400"
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
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition-colors w-full"
            >
              العودة للشاشة الرئيسية
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;