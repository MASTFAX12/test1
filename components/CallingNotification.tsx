import React from 'react';
import type { PatientVisit } from '../types.ts';

interface CallingNotificationProps {
  patient: PatientVisit | null;
  onClose: () => void;
}

const CallingNotification: React.FC<CallingNotificationProps> = ({ patient, onClose }) => {
  if (!patient) return null;

  return (
    <div 
      className="fixed bottom-5 right-5 bg-gradient-to-r from-blue-500 to-cyan-400 text-white p-6 rounded-2xl shadow-2xl animate-fade-in-up border-4 border-white/50 z-50"
      role="alert"
    >
      <div className="flex flex-col items-center text-center">
        <h3 className="text-2xl font-bold mb-2">جاري النداء على</h3>
        <p className="text-5xl font-black tracking-wider break-words">
          {patient.name}
        </p>
        <button 
          onClick={onClose}
          className="mt-6 bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
        >
          إخفاء
        </button>
      </div>
    </div>
  );
};

export default CallingNotification;
