

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Timestamp } from 'firebase/firestore';
import { useQueue } from './hooks/useQueue.ts';
import { useSettings } from './hooks/useSettings.ts';
import { usePrevious } from './hooks/usePrevious.ts';
import { Role, PatientStatus } from './types.ts';
import type { PatientVisit, Service, CustomLineItem } from './types.ts';
import { 
  updatePatientStatus, 
  cancelPatient, 
  deletePatientVisit,
  updatePatientDetails, 
  updateClinicSettings, 
  reorderPatientQueue
} from './services/firebase.ts';
import { playNotificationSound } from './utils/audio.ts';
import { getThemeById } from './types.ts';

import AdminPanel from './components/AdminPanel.tsx';
import CurrentPatientCard from './components/CurrentPatientCard.tsx';
import LoginModal from './components/LoginModal.tsx';
import Marquee from './components/Marquee.tsx';
import TimeDisplay from './components/TimeDisplay.tsx';
import CallingNotification from './components/CallingNotification.tsx';
import SettingsModal from './components/SettingsModal.tsx';
import HelpModal from './components/HelpModal.tsx';
import AddPatientModal from './components/AddPatientModal.tsx';
import { ArrowUturnLeftIcon, LockClosedIcon } from './components/Icons.tsx';

function App() {
  const { patients, loading: queueLoading } = useQueue();
  const { settings, loading: settingsLoading } = useSettings();
  const [role, setRole] = useState<Role>(Role.Public);
  const [loggedInUserRole, setLoggedInUserRole] = useState<Role>(Role.None);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [isAddPatientModalOpen, setAddPatientModalOpen] = useState(false);
  
  const [callingPatient, setCallingPatient] = useState<PatientVisit | null>(null);
  const [callTimeoutId, setCallTimeoutId] = useState<number | null>(null);
  
  const [notifiedPatient, setNotifiedPatient] = useState<PatientVisit | null>(null);

  const prevPatients = usePrevious(patients);
  
  useEffect(() => {
    document.documentElement.style.setProperty('--theme-color', settings.themeColor);
    try {
        localStorage.setItem('clinic-theme-color', settings.themeColor);
    } catch (e) {
        console.error("Failed to save theme to localStorage", e);
    }
    
    // Apply theme for public view or default for admin
    document.body.className = ''; // Reset classes
    if (role === Role.Public) {
        const currentTheme = getThemeById(settings.publicTheme);
        document.body.classList.add(...currentTheme.background.split(' '));
    } else {
        document.body.classList.add('bg-slate-100');
    }
    
    document.body.dir = 'rtl';
  }, [settings.themeColor, settings.publicTheme, role]);

  useEffect(() => {
    if (role !== Role.Public && prevPatients && patients.length > prevPatients.length) {
      if (settings.callSoundEnabled) {
          playNotificationSound();
      }
      toast.success('تمت إضافة مراجع جديد!', { position: 'bottom-left' });
    }
  }, [patients, prevPatients, role, settings.callSoundEnabled]);

  const handleLoginSuccess = (loggedInRole: Role) => {
    setLoggedInUserRole(loggedInRole);
    setRole(loggedInRole);
    setLoginModalOpen(false);
  };
  
  const handleLogout = () => {
    setLoggedInUserRole(Role.None);
    setRole(Role.Public);
  };

  const handleCallPatient = useCallback((patient: PatientVisit) => {
    if (settings.callSoundEnabled) {
      playNotificationSound();
    }
    setCallingPatient(patient);
    setNotifiedPatient(patient);

    if (callTimeoutId) clearTimeout(callTimeoutId);

    const duration = (settings.callDuration || 10) * 1000;
    const newTimeoutId = setTimeout(() => {
      setCallingPatient(null);
    }, duration);
    setCallTimeoutId(newTimeoutId);
  }, [settings.callSoundEnabled, settings.callDuration, callTimeoutId]);
  
  const handleStopCall = useCallback(() => {
    if (callTimeoutId) {
        clearTimeout(callTimeoutId);
    }
    setCallingPatient(null);
    setNotifiedPatient(null);
    setCallTimeoutId(null);
  }, [callTimeoutId]);

  const handleUpdateStatus = async (id: string, status: PatientStatus) => {
    try {
      await updatePatientStatus(id, status);
      toast.success('تم تحديث حالة المراجع.');
    } catch (error) {
      toast.error('فشل تحديث الحالة.');
      console.error(error);
    }
  };

  const handleCancel = async (id: string) => {
    // Confirmation is now handled by ConfirmationModal
    const toastId = toast.loading('جاري الأرشفة...');
    try {
        await cancelPatient(id);
        toast.success('تمت أرشفة المراجع.', { id: toastId });
    } catch (error) {
        toast.error('فشلت الأرشفة.', { id: toastId });
        console.error(error);
    }
  };

  const handleDeletePatient = async (id: string) => {
    // Confirmation is now handled by ConfirmationModal
    const toastId = toast.loading('جاري الحذف النهائي...');
    try {
        await deletePatientVisit(id);
        toast.success('تم حذف المراجع نهائياً.', { id: toastId });
    } catch (error) {
        toast.error('فشل حذف المراجع.', { id: toastId });
        console.error(error);
    }
  };
  
  const handleReorder = async (patientId: string, newTimestamp: Timestamp) => {
    try {
        await reorderPatientQueue(patientId, newTimestamp);
    } catch (error) {
        toast.error('فشل في تغيير الترتيب.');
        console.error("Failed to reorder:", error);
    }
  };
  
  const handleSetServices = async (patient: PatientVisit, services: Service[], customItems: CustomLineItem[]) => {
      const servicesTotal = services.reduce((acc, s) => acc + s.price, 0);
      const customItemsTotal = customItems.reduce((acc, i) => acc + i.price, 0);
      const requiredAmount = servicesTotal + customItemsTotal;
      
      try {
          await updatePatientDetails(patient.id, {
              servicesRendered: services,
              customLineItems: customItems,
              requiredAmount: requiredAmount,
              sentToPaymentAt: Timestamp.now()
          });
          await updatePatientStatus(patient.id, PatientStatus.PendingPayment);
          toast.success(`تم تحديد رسوم ${patient.name} وإرسالها للسكرتير.`);
      } catch (error) {
          toast.error('فشل في تحديد الرسوم.');
          console.error(error);
      }
  };

  const inProgressPatient = useMemo(() => patients.find(p => p.status === PatientStatus.InProgress), [patients]);
  const waitingPatients = useMemo(() => patients.filter(p => p.status === PatientStatus.Waiting), [patients]);

  if (queueLoading || settingsLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl font-semibold">جاري تحميل بيانات العيادة...</p>
      </div>
    );
  }

  // PUBLIC VIEW
  if (role === Role.Public) {
    const PUBLIC_DISPLAY_LIMIT = 15;
    const displayedWaiting = waitingPatients.slice(0, PUBLIC_DISPLAY_LIMIT);
    const currentTheme = getThemeById(settings.publicTheme);

    return (
      <>
        <main className="container mx-auto p-4 md:p-6 grid grid-rows-[auto_1fr_auto] gap-6 h-screen">
          <header className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-right">
              <h1 className={`text-4xl md:text-5xl font-bold ${currentTheme.primaryText}`}>{settings.clinicName}</h1>
              <p className={`text-lg md:text-xl ${currentTheme.secondaryText}`}>{settings.doctorName} - {settings.clinicSpecialty}</p>
            </div>
            <TimeDisplay theme={currentTheme} />
          </header>

          <div className="grid md:grid-cols-3 gap-6 overflow-hidden">
            <div className="md:col-span-2">
              <CurrentPatientCard 
                patient={inProgressPatient} 
                callingPatient={callingPatient}
                title="في غرفة الفحص"
                noPatientText="لا يوجد مراجع حالياً"
                callingTitle="الرجاء التوجه لغرفة الفحص"
                theme={currentTheme}
              />
            </div>
            <div className={`${currentTheme.cardBackground} p-4 rounded-2xl shadow-lg border ${currentTheme.cardBorder} flex flex-col`}>
              <h2 className={`text-2xl font-bold text-center ${currentTheme.primaryText} mb-4 flex-shrink-0`}>قائمة الانتظار ({waitingPatients.length})</h2>
              <ul className="space-y-3 overflow-y-auto h-full pr-2">
                {displayedWaiting.length > 0 ? (
                  displayedWaiting.map((p, index) => (
                    <li key={p.id} className={`${currentTheme.listItemDefaultBackground} p-3 rounded-lg text-xl md:text-2xl font-semibold ${currentTheme.primaryText} shadow-sm flex items-center gap-4 animate-fade-in`}>
                      <span className="bg-[var(--theme-color)] text-white rounded-full h-9 w-9 flex items-center justify-center font-bold text-base flex-shrink-0 shadow-md">{index + 1}</span>
                      {p.name}
                    </li>
                  ))
                ) : (
                  <p className={`text-center ${currentTheme.secondaryText} pt-8`}>لا يوجد مراجعون في الانتظار.</p>
                )}
                 {waitingPatients.length > PUBLIC_DISPLAY_LIMIT && (
                    <li className={`text-center ${currentTheme.secondaryText} pt-2 text-lg`}>
                        ... و {waitingPatients.length - PUBLIC_DISPLAY_LIMIT} آخرون في الانتظار
                    </li>
                 )}
              </ul>
            </div>
          </div>

          <footer className="flex justify-between items-center gap-4">
            <Marquee text={settings.publicMessage} speed={settings.marqueeSpeed} theme={currentTheme} />
          </footer>
        </main>
        <button
            onClick={() => {
              if (loggedInUserRole !== Role.None && loggedInUserRole !== Role.Public) {
                setRole(loggedInUserRole);
              } else {
                setLoginModalOpen(true);
              }
            }}
            className="fixed bottom-6 right-6 bg-white/20 backdrop-blur-lg p-3 rounded-full shadow-lg border border-white/20 hover:bg-white/30 transition-transform hover:scale-105 flex items-center gap-2 group"
          >
            {loggedInUserRole !== Role.None && loggedInUserRole !== Role.Public ? 
              <>
                <ArrowUturnLeftIcon className="w-6 h-6 text-white" />
                <span className="text-white font-semibold pr-2 hidden group-hover:block animate-fade-in">العودة للوحة التحكم</span>
              </>
               : 
              <>
                <LockClosedIcon className="w-6 h-6 text-white"/>
                <span className="text-white font-semibold pr-2 hidden group-hover:block animate-fade-in">تسجيل الدخول للإدارة</span>
              </>
            }
          </button>
        {isLoginModalOpen && <LoginModal onClose={() => setLoginModalOpen(false)} onLoginSuccess={handleLoginSuccess} settings={settings} />}
      </>
    );
  }

  // ADMIN VIEW (Doctor or Secretary)
  return (
    <>
      <AdminPanel
        role={role}
        settings={settings}
        patients={patients}
        callingPatient={callingPatient}
        onLogout={handleLogout}
        onShowPublicView={() => setRole(Role.Public)}
        onOpenHelpModal={() => setHelpModalOpen(true)}
        onOpenSettingsModal={() => setSettingsModalOpen(true)}
        onOpenAddPatientModal={() => setAddPatientModalOpen(true)}
        onUpdateStatus={handleUpdateStatus}
        onCancel={handleCancel}
        onDeletePatient={handleDeletePatient}
        onCall={handleCallPatient}
        onStopCall={handleStopCall}
        onReorder={handleReorder}
        onSetPatientServices={handleSetServices}
      />
      
      <Toaster toastOptions={{
          style: {
            fontFamily: 'Tajawal, sans-serif',
          },
      }} />

      {/* Modals */}
      <CallingNotification patient={notifiedPatient} onClose={() => setNotifiedPatient(null)} />
      {isSettingsModalOpen && role === Role.Doctor && <SettingsModal settings={settings} onClose={() => setSettingsModalOpen(false)} />}
      {isAddPatientModalOpen && role === Role.Secretary && <AddPatientModal settings={settings} onClose={() => setAddPatientModalOpen(false)} />}
      
      {isHelpModalOpen && (
          <HelpModal
            role={role}
            onClose={() => setHelpModalOpen(false)}
          />
      )}
    </>
  );
}

export default App;