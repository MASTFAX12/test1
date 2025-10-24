import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Timestamp } from 'firebase/firestore';
import { useQueue } from './hooks/useQueue.ts';
import { useSettings } from './hooks/useSettings.ts';
import { usePrevious } from './hooks/usePrevious.ts';
import { useChat } from './hooks/useChat.ts';
import { usePatientProfiles } from './hooks/usePatientProfiles.ts';
import { Role, PatientStatus } from './types.ts';
import type { PatientVisit } from './types.ts';
import { 
  updatePatientStatus, 
  archivePatientVisit, 
  deletePatientVisit,
  reorderPatientQueue,
  updatePatientDetails,
} from './services/firebase.ts';
import { playNotificationSound, playChatMessageSound } from './utils/audio.ts';
import { getThemeById } from './types.ts';

import AdminPanel from './components/AdminPanel.tsx';
import CurrentPatientCard from './components/CurrentPatientCard.tsx';
import LoginModal from './components/LoginModal.tsx';
import TimeDisplay from './components/TimeDisplay.tsx';
import CallingNotification from './components/CallingNotification.tsx';
import SettingsModal from './components/SettingsModal.tsx';
import HelpModal from './components/HelpModal.tsx';
import AddPatientModal from './components/AddPatientModal.tsx';
import { ArrowUturnLeftIcon, LockClosedIcon } from './components/Icons.tsx';

function App() {
  const { patients, loading: queueLoading } = useQueue();
  const { settings, loading: settingsLoading } = useSettings();
  const { messages } = useChat();
  const { patientProfiles, loading: profilesLoading } = usePatientProfiles();

  const [role, setRole] = useState<Role>(Role.Public);
  const [loggedInUserRole, setLoggedInUserRole] = useState<Role>(Role.None);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [isAddPatientModalOpen, setAddPatientModalOpen] = useState(false);
  
  const [callingPatient, setCallingPatient] = useState<PatientVisit | null>(null);
  const [callTimeoutId, setCallTimeoutId] = useState<number | null>(null);
  const [notifiedPatient, setNotifiedPatient] = useState<PatientVisit | null>(null);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const prevPatients = usePrevious(patients);
  const prevMessages = usePrevious(messages);
  
  useEffect(() => {
    document.documentElement.style.setProperty('--theme-color', settings.themeColor);
    try {
        localStorage.setItem('clinic-theme-color', settings.themeColor);
    } catch (e) {
        console.error("Failed to save theme to localStorage", e);
    }
    
    document.body.className = '';
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

  // Refactored chat notification logic
  useEffect(() => {
    if (role === Role.Public || loggedInUserRole === Role.None) {
        setUnreadChatCount(0); // Reset when not logged in to an admin role
        return;
    }

    if (!messages) return;

    // 1. Play sound only when a new message actually arrives from someone else
    if (prevMessages && messages.length > prevMessages.length) {
        const latestMessage = messages[messages.length - 1];
        if (latestMessage && latestMessage.sender !== loggedInUserRole) {
            playChatMessageSound();
        }
    }

    // 2. Calculate unread count for the badge based on the last read timestamp
    const lastReadTimestamp = Number(localStorage.getItem('chatLastReadTimestamp') || '0');
    const newUnreadCount = messages.filter(
        msg => msg.createdAt.toMillis() > lastReadTimestamp && msg.sender !== loggedInUserRole
    ).length;

    setUnreadChatCount(newUnreadCount);

  }, [messages, prevMessages, role, loggedInUserRole]);


  const handleLoginSuccess = (loggedInRole: Role) => {
    setLoggedInUserRole(loggedInRole);
    setRole(loggedInRole);
    setLoginModalOpen(false);
  };
  
  const handleLogout = () => {
    setLoggedInUserRole(Role.None);
    setRole(Role.Public);
  };

  const handleUpdateStatus = useCallback(async (id: string, status: PatientStatus) => {
    try {
      const patientToUpdate = patients.find(p => p.id === id);
      const isReturningFromArchive = patientToUpdate && 
        [PatientStatus.Done, PatientStatus.Archived].includes(patientToUpdate.status);

      if (status === PatientStatus.Waiting && isReturningFromArchive) {
        await updatePatientDetails(id, { status: PatientStatus.Waiting, createdAt: Timestamp.now() });
      } else {
        await updatePatientStatus(id, status);
      }
      toast.success('تم تحديث حالة المراجع.');
    } catch (error) {
      toast.error('فشل تحديث الحالة.');
      console.error(error);
    }
  }, [patients]);

  const handleCallPatient = useCallback((patient: PatientVisit) => {
    if (settings.autoInProgressOnCall) {
      handleUpdateStatus(patient.id, PatientStatus.InProgress);
    }

    if (settings.callSoundEnabled) {
      playNotificationSound();
    }
    setCallingPatient(patient);
    setNotifiedPatient(patient);

    if (callTimeoutId) clearTimeout(callTimeoutId);

    const duration = (settings.callDuration || 10) * 1000;
    const newTimeoutId = window.setTimeout(() => {
      setCallingPatient(null);
    }, duration);
    setCallTimeoutId(newTimeoutId);
  }, [settings.callSoundEnabled, settings.callDuration, callTimeoutId, settings.autoInProgressOnCall, handleUpdateStatus]);
  
  // Effect for auto-calling next patient
  useEffect(() => {
    if (!settings.autoCallNextOnDone || !prevPatients || role === Role.Public) return;

    const justFinishedPatient = prevPatients.find(
      p => p.status === PatientStatus.InProgress && patients.find(np => np.id === p.id)?.status === PatientStatus.Done
    );

    if (justFinishedPatient) {
      const nextPatientInQueue = patients.find(p => p.status === PatientStatus.Waiting);
      if (nextPatientInQueue) {
        toast.success(`تم إنهاء زيارة ${justFinishedPatient.name}. جاري النداء على التالي...`, {
          duration: 4000,
          position: 'bottom-left'
        });
        // Delay slightly to make it feel more natural
        setTimeout(() => {
          handleCallPatient(nextPatientInQueue);
        }, 1000);
      }
    }
  }, [patients, prevPatients, settings.autoCallNextOnDone, handleCallPatient, role]);


  const handleStopCall = useCallback(() => {
    if (callTimeoutId) {
        clearTimeout(callTimeoutId);
    }
    setCallingPatient(null);
    setNotifiedPatient(null);
    setCallTimeoutId(null);
  }, [callTimeoutId]);

  const handleArchive = async (id: string) => {
    const toastId = toast.loading('جاري الأرشفة...');
    try {
        await archivePatientVisit(id);
        toast.success('تمت أرشفة المراجع.', { id: toastId });
    } catch (error) {
        toast.error('فشلت الأرشفة.', { id: toastId });
        console.error(error);
    }
  };

  const handleDeletePatient = async (id: string) => {
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

  const handleViewChat = () => {
    setUnreadChatCount(0);
    // Use the timestamp of the latest message as the "read" marker to avoid clock skew issues.
    if (messages && messages.length > 0) {
        // Find the timestamp of the very last message in the chat
        const latestMessageTimestamp = messages[messages.length - 1].createdAt.toMillis();
        localStorage.setItem('chatLastReadTimestamp', String(latestMessageTimestamp));
    } else {
        // If chat is empty, just use the current time
        localStorage.setItem('chatLastReadTimestamp', String(Date.now()));
    }
  };


  const inProgressPatient = useMemo(() => patients.find(p => p.status === PatientStatus.InProgress), [patients]);
  const waitingPatients = useMemo(() => patients.filter(p => p.status === PatientStatus.Waiting), [patients]);

  if (queueLoading || settingsLoading || profilesLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl font-semibold">جاري تحميل بيانات العيادة...</p>
      </div>
    );
  }

  if (role === Role.Public) {
    const PUBLIC_DISPLAY_LIMIT = 15;
    const displayedWaiting = waitingPatients.slice(0, PUBLIC_DISPLAY_LIMIT);
    const currentTheme = getThemeById(settings.publicTheme);

    return (
      <>
        <main className="w-full p-4 md:p-6 flex flex-col gap-6 min-h-screen">
          <header className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-right">
              <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black ${currentTheme.primaryText}`}>{settings.clinicName}</h1>
              <p className={`text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl ${currentTheme.secondaryText}`}>{settings.doctorName} - {settings.clinicSpecialty}</p>
            </div>
            <TimeDisplay theme={currentTheme} />
          </header>

          <div className="flex-grow flex flex-col md:flex-row gap-6 overflow-hidden">
            <div className="w-full md:w-1/2 flex flex-col">
              <CurrentPatientCard 
                patient={inProgressPatient} 
                callingPatient={callingPatient}
                title="في غرفة الفحص"
                noPatientText="لا يوجد مراجع حالياً"
                callingTitle="الرجاء التوجه لغرفة الفحص"
                theme={currentTheme}
              />
            </div>
            <div className={`${currentTheme.cardBackground} p-4 rounded-2xl shadow-lg border ${currentTheme.cardBorder} flex flex-col w-full md:w-1/2`}>
              <h2 className={`text-2xl lg:text-3xl xl:text-4xl font-bold text-center ${currentTheme.primaryText} mb-4 flex-shrink-0`}>قائمة الانتظار ({waitingPatients.length})</h2>
              <ul className="space-y-3 overflow-y-auto h-full pr-2">
                {displayedWaiting.length > 0 ? (
                  displayedWaiting.map((p, index) => (
                    <li key={p.id} className={`${currentTheme.listItemDefaultBackground} p-3 rounded-lg text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold ${currentTheme.primaryText} shadow-sm flex items-center gap-4 animate-fade-in`}>
                      <span className="bg-[var(--theme-color)] text-white rounded-full h-9 w-9 lg:h-12 lg:w-12 lg:text-xl xl:h-14 xl:w-14 xl:text-2xl flex items-center justify-center font-bold flex-shrink-0 shadow-md">{index + 1}</span>
                      <span className="min-w-0 break-words">{p.name}</span>
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

  return (
    <>
      <AdminPanel
        role={role}
        settings={settings}
        patients={patients}
        patientProfiles={patientProfiles}
        callingPatient={callingPatient}
        onLogout={handleLogout}
        onShowPublicView={() => setRole(Role.Public)}
        onOpenHelpModal={() => setHelpModalOpen(true)}
        onOpenSettingsModal={() => setSettingsModalOpen(true)}
        onOpenAddPatientModal={() => setAddPatientModalOpen(true)}
        onUpdateStatus={handleUpdateStatus}
        onArchive={handleArchive}
        onDeletePatient={handleDeletePatient}
        onCall={handleCallPatient}
        onStopCall={handleStopCall}
        onReorder={handleReorder}
        unreadChatCount={unreadChatCount}
        onViewChat={handleViewChat}
      />
      
      <Toaster toastOptions={{
          style: {
            fontFamily: 'Tajawal, sans-serif',
          },
      }} />

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
