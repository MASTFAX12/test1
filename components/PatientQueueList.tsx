
import React, { useState, useEffect } from 'react';
import type { Patient } from '../types';
import { PatientStatus } from '../types';
import { updatePatientStatus, deletePatient } from '../services/firebase';
import EditablePatientCard from './EditablePatientCard';

interface PatientQueueListProps {
  patients: Patient[];
  isAdmin: boolean;
  activelyCallingPatientId?: string | null;
  onCallPatient?: (patient: Patient) => void;
  onDismissCall?: () => void;
}

const PatientCard: React.FC<{ 
  patient: Patient; 
  queueNumber?: number; 
  isAdmin: boolean; 
  onEdit: () => void;
  isBeingCalled: boolean;
  onCall: () => void;
  onDismissCall: () => void;
}> = ({ patient, queueNumber, isAdmin, onEdit, isBeingCalled, onCall, onDismissCall }) => {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // Reset confirmation state if the component's patient prop changes to avoid stale state.
  useEffect(() => {
    setConfirmingDelete(false);
  }, [patient.id]);
  
  const handleComplete = () => updatePatientStatus(patient.id, PatientStatus.Completed);
  const handleCancel = () => updatePatientStatus(patient.id, PatientStatus.Cancelled);
  const finalDelete = () => {
    deletePatient(patient.id);
  };

  const statusConfig = {
    [PatientStatus.Waiting]: { text: 'انتظار', color: 'bg-blue-500', gradient: 'bg-gradient-to-br from-blue-500 to-cyan-400', icon: null, borderColor: 'border-transparent' },
    [PatientStatus.InProgress]: { text: 'بالداخل', color: 'bg-green-500', gradient: 'bg-gradient-to-br from-green-500 to-emerald-400', icon: '▶', borderColor: 'border-green-400' },
    [PatientStatus.Completed]: { text: 'اكتمل', color: 'bg-gray-500', gradient: 'bg-gradient-to-br from-gray-500 to-slate-400', icon: '✓', borderColor: 'border-transparent' },
    [PatientStatus.Cancelled]: { text: 'ملغي', color: 'bg-yellow-500', gradient: 'bg-gradient-to-br from-yellow-500 to-amber-400', icon: '✗', borderColor: 'border-transparent' },
  };
  
  const currentStatus = statusConfig[patient.status];
  const borderPulse = isBeingCalled ? 'animate-pulse' : '';
  
  const adminActions = confirmingDelete ? (
    <>
      <span className="text-sm text-red-700 font-bold hidden sm:inline">متأكد؟</span>
      <button onClick={finalDelete} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-md transition duration-200 text-sm">نعم, احذف</button>
      <button onClick={() => setConfirmingDelete(false)} className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded-md transition duration-200 text-sm">إلغاء</button>
    </>
  ) : (
    <>
      {patient.status === PatientStatus.Waiting && (
        <>
          <button onClick={onCall} className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded-md transition duration-200 text-sm">استدعاء</button>
          <button onClick={handleCancel} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded-md transition duration-200 text-sm">إلغاء</button>
        </>
      )}
      {patient.status === PatientStatus.InProgress && (
        isBeingCalled ? (
          <button onClick={onDismissCall} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-1 px-3 rounded-md transition duration-200 text-sm animate-pulse">إخفاء النداء</button>
        ) : (
          <button onClick={handleComplete} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-md transition duration-200 text-sm">إنهاء</button>
        )
      )}
       <button onClick={onEdit} className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded-md transition duration-200 text-sm">تعديل</button>
       <button onClick={() => setConfirmingDelete(true)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-md transition duration-200 text-sm">حذف</button>
    </>
  );

  return (
    <div className={`bg-gradient-to-r from-slate-50 to-gray-100 text-gray-800 rounded-xl p-4 mb-3 flex items-center gap-4 shadow-md border-2 ${currentStatus.borderColor} ${borderPulse} hover:border-blue-300 transition-all duration-300`}>
      <div className={`${currentStatus.gradient} text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-lg`}>
        {patient.status === PatientStatus.Waiting ? queueNumber : currentStatus.icon}
      </div>
      <div className="flex-1 min-w-0">
         <div className="flex items-center justify-between gap-2">
           <p className="text-4xl font-bold truncate">{patient.name}</p>
           {isAdmin && patient.status !== PatientStatus.Waiting && <span className={`text-xs font-bold text-white px-2 py-1 rounded-full ${currentStatus.color}`}>{currentStatus.text}</span>}
        </div>
        <p className="text-sm text-gray-600 truncate">{patient.reason || 'زيارة عامة'}</p>
      </div>
      {isAdmin && (
        <div className="flex gap-2 flex-wrap justify-end items-center">
          {adminActions}
        </div>
      )}
    </div>
  );
};

const PatientQueueList: React.FC<PatientQueueListProps> = ({ patients, isAdmin, activelyCallingPatientId, onCallPatient, onDismissCall }) => {
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
  const waitingPatients = patients.filter(p => p.status === PatientStatus.Waiting);

  if (isAdmin) {
    const sortedPatients = [...patients].sort((a, b) => {
      const statusOrder = {
        [PatientStatus.InProgress]: 1,
        [PatientStatus.Waiting]: 2,
        [PatientStatus.Cancelled]: 3,
        [PatientStatus.Completed]: 4,
      };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      if (a.status === PatientStatus.Waiting) {
        return a.createdAt.toMillis() - b.createdAt.toMillis();
      }
      return b.createdAt.toMillis() - a.createdAt.toMillis();
    });

    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-blue-500/20 h-full flex flex-col">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-4 flex-shrink-0">
          إدارة قائمة المراجعين
        </h2>
        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          {sortedPatients.length > 0 ? (
            sortedPatients.map((patient) => {
              if (patient.id === editingPatientId) {
                return (
                  <EditablePatientCard
                    key={patient.id}
                    patient={patient}
                    onSave={() => setEditingPatientId(null)}
                    onCancel={() => setEditingPatientId(null)}
                  />
                );
              }
              const queueNumber = waitingPatients.findIndex(p => p.id === patient.id) + 1;
              return (
                <PatientCard 
                  key={patient.id} 
                  patient={patient} 
                  queueNumber={queueNumber > 0 ? queueNumber : undefined} 
                  isAdmin={isAdmin} 
                  onEdit={() => setEditingPatientId(patient.id)}
                  isBeingCalled={patient.id === activelyCallingPatientId}
                  onCall={() => onCallPatient?.(patient)}
                  onDismissCall={() => onDismissCall?.()}
                />
              );
            })
          ) : (
            <div className="text-center text-gray-500 pt-16">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-2xl font-semibold">لا يوجد مراجعين اليوم</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Public View remains unchanged
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-blue-500/20 h-full flex flex-col">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-4 flex-shrink-0">
        📋 المراجعين التاليين
      </h2>
      <div className="flex-1 overflow-y-auto pr-2 -mr-2">
        {waitingPatients.length > 0 ? (
          waitingPatients.map((patient, index) => (
            <PatientCard 
              key={patient.id} 
              patient={patient} 
              queueNumber={index + 1} 
              isAdmin={isAdmin} 
              onEdit={() => {}}
              isBeingCalled={false}
              onCall={() => {}}
              onDismissCall={() => {}}
            />
          ))
        ) : (
          <div className="text-center text-gray-500 pt-16">
            <div className="text-6xl mb-4">😊</div>
            <p className="text-2xl font-semibold">لا يوجد مراجعين في قائمة الانتظار</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientQueueList;
