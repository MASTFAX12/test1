import React, { useState } from 'react';
import type { Patient } from '../types.ts';
import { PatientStatus } from '../types.ts';
import { ChartBarIcon, XMarkIcon } from './Icons.tsx';

interface StatsPanelProps {
  patients: Patient[];
}

const StatsPanel: React.FC<StatsPanelProps> = ({ patients }) => {
  const [isOpen, setIsOpen] = useState(false);

  const waitingCount = patients.filter(p => p.status === PatientStatus.Waiting).length;
  const inProgressCount = patients.filter(p => p.status === PatientStatus.InProgress).length;
  const doneCount = patients.filter(p => p.status === PatientStatus.Done || p.status === PatientStatus.Skipped).length;
  const totalCount = patients.length;
  const totalRevenue = patients.reduce((acc, p) => acc + (p.amountPaid || 0), 0);

  if (!isOpen) {
    return (
        <button 
            onClick={() => setIsOpen(true)} 
            className="bg-purple-600 text-white w-16 h-16 rounded-full shadow-lg hover:bg-purple-700 flex items-center justify-center transition"
            title="عرض الإحصائيات"
        >
            <ChartBarIcon className="w-8 h-8"/>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-white">
                {totalCount}
            </span>
        </button>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-lg p-6 rounded-2xl shadow-2xl border border-gray-200 w-80 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">إحصائيات اليوم</h2>
        <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-gray-200">
            <XMarkIcon className="w-5 h-5 text-gray-600"/>
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 text-center">
        <StatCard value={totalCount} label="الإجمالي" color="blue" />
        <StatCard value={waitingCount} label="انتظار" color="yellow" />
        <StatCard value={inProgressCount} label="معالجة" color="red" />
        <StatCard value={doneCount} label="مكتمل" color="green" />
        <div className="bg-purple-100 p-3 rounded-lg col-span-2">
          <p className="text-2xl font-bold text-purple-800">{totalRevenue.toLocaleString()}</p>
          <p className="text-sm font-medium text-purple-600">الإيرادات (د.ع)</p>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
    value: number | string;
    label: string;
    color: 'blue' | 'yellow' | 'red' | 'green';
}

const StatCard: React.FC<StatCardProps> = ({ value, label, color }) => {
    const colors = {
        blue: 'bg-blue-100 text-blue-800',
        yellow: 'bg-yellow-100 text-yellow-800',
        red: 'bg-red-100 text-red-800',
        green: 'bg-green-100 text-green-800',
    };
    return (
        <div className={`${colors[color]} p-3 rounded-lg`}>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm font-medium">{label}</p>
        </div>
    )
}


export default StatsPanel;