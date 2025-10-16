import React, { useState, useMemo } from 'react';
import { useQueue } from './hooks/useQueue.ts';
import type { Patient } from './types.ts';
import { PatientStatus } from './types.ts';
import { playNotificationSound } from './utils/audio.ts';
import { updatePatientStatus } from './services/firebase.ts';
import CurrentPatientCard from './components/CurrentPatientCard.tsx';
import PatientQueueList from './components/PatientQueueList.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import LoginModal from './components/LoginModal.tsx';
import { GearIcon } from './components/Icons.tsx';
import TimeDisplay from './components/TimeDisplay.tsx';
import StatsPanel from './components/StatsPanel.tsx';

const App: React.FC = () => {
  const { patients, loading, error } = useQueue();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activelyCallingPatientId, setActivelyCallingPatientId] = useState<string | null>(null);

  const handleInitiateCall = (patient: Patient) => {
    // First, ensure no other patient is stuck in the "in progress" state
    const currentInProgress = patients.find(p => p.status === PatientStatus.InProgress);
    if (currentInProgress && currentInProgress.id !== patient.id) {
      // Optionally, move the previous patient to 'completed' or handle as needed
      updatePatientStatus(currentInProgress.id, PatientStatus.Completed);
    }
    
    updatePatientStatus(patient.id, PatientStatus.InProgress);
    setActivelyCallingPatientId(patient.id);
    playNotificationSound();
  };

  const handleDismissCall = () => {
    setActivelyCallingPatientId(null);
  };

  // Derived state ensures the calling patient object is never stale
  const activelyCallingPatient = useMemo(
    () => patients.find(p => p.id === activelyCallingPatientId) || null,
    [patients, activelyCallingPatientId]
  );

  const currentPatient = useMemo(() => patients.find(p => p.status === PatientStatus.InProgress), [patients]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] min-h-screen flex items-center justify-center text-white text-2xl">
        جاري تحميل البيانات...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] min-h-screen flex items-center justify-center text-red-400 text-2xl">
        حدث خطأ: {error.message}
      </div>
    );
  }

  return (
    <>
      {isModalOpen && (
        <LoginModal
          onClose={() => setIsModalOpen(false)}
          onLoginSuccess={() => {
            setIsAdmin(true);
            setIsModalOpen(false);
          }}
        />
      )}

      {isAdmin ? (
        // Full-screen Admin Dashboard
        <div className="bg-slate-100 min-h-screen text-gray-800 grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <AdminPanel />
            <StatsPanel patients={patients} />
            <button
              onClick={() => setIsAdmin(false)}
              className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors mt-auto"
            >
              تسجيل الخروج
            </button>
          </div>
          <div className="lg:col-span-3 h-[calc(100vh-3rem)]">
            <PatientQueueList 
              patients={patients} 
              isAdmin={isAdmin}
              activelyCallingPatientId={activelyCallingPatientId}
              onCallPatient={handleInitiateCall}
              onDismissCall={handleDismissCall}
            />
          </div>
        </div>
      ) : (
        // Public View
        <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] min-h-screen text-white overflow-hidden selection:bg-cyan-300 selection:text-cyan-900">
          <header className="p-4 flex items-center bg-black/20 backdrop-blur-sm">
            <div className="flex-1">
              {/* Left spacer */}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide text-center px-4">
              عيادة الدكتور محمد عباس المشهداني
            </h1>
            <div className="flex-1 flex justify-end items-center gap-4">
              <TimeDisplay />
              <button
                onClick={() => setIsModalOpen(true)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label={'الدخول كمسؤول'}
              >
                <GearIcon className="w-6 h-6" />
              </button>
            </div>
          </header>

          <main className="p-4 lg:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
              <div className="lg:col-span-1 h-full">
                <CurrentPatientCard 
                  patient={currentPatient} 
                  callingPatient={activelyCallingPatient} 
                />
              </div>
              <div className="lg:col-span-2 h-full">
                <PatientQueueList patients={patients} isAdmin={isAdmin} />
              </div>
            </div>
          </main>
        </div>
      )}
    </>
  );
};

export default App;