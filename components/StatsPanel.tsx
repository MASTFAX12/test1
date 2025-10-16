
import React from 'react';
import { PatientStatus } from '../types.ts';
import type { Patient } from '../types.ts';

interface StatsPanelProps {
  patients: Patient[];
}

const StatsPanel: React.FC<StatsPanelProps> = ({ patients }) => {
  const waitingCount = patients.filter(p => p.status === PatientStatus.Waiting).length;
  const inProgressCount = patients.filter(p => p.status === PatientStatus.InProgress).length;
  const totalToday = patients.length;

  return (
    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg border-2 border-blue-500/20">
       <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">إحصائيات اليوم</h3>
      <div className="grid grid-cols-3 gap-3 text-gray-800">
        <div className="bg-blue-100 p-3 rounded-lg text-center">
          <div className="text-3xl font-bold">{waitingCount}</div>
          <div className="text-xs text-blue-800 font-semibold">في الانتظار</div>
        </div>
        <div className="bg-green-100 p-3 rounded-lg text-center">
          <div className="text-3xl font-bold">{inProgressCount}</div>
          <div className="text-xs text-green-800 font-semibold">داخل العيادة</div>
        </div>
        <div className="bg-gray-200 p-3 rounded-lg text-center">
          <div className="text-3xl font-bold">{totalToday}</div>
          <div className="text-xs text-gray-700 font-semibold">إجمالي اليوم</div>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;