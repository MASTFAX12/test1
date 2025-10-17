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
  uploadProfilePicture, 
  updateClinicSettings, 
  reorderPatientQueue
} from './services/firebase.ts';
import { playNotificationSound } from './utils/audio.ts';

import AdminHeader from './components/AdminHeader.tsx';
import PatientQueueList from './components/PatientQueueList.tsx';
import CurrentPatientCard from './components/CurrentPatientCard.tsx';
import LoginModal from './components/LoginModal.tsx';
import Marquee from './components/Marquee.tsx';
import TimeDisplay from './components/TimeDisplay.tsx';
import CallingNotification from './components/CallingNotification.tsx';
import SettingsModal from './components/SettingsModal.tsx';
import ProfilePictureModal from './components/ProfilePictureModal.tsx';
import AdminSidebar from './components/AdminSidebar.tsx';
import HelpModal from './components/HelpModal.tsx';
import { Cog8ToothIcon, ArrowUturnLeftIcon } from './components/Icons.tsx';

function App() {
  const { patients, loading: queueLoading } = useQueue();
  const { settings, loading: settingsLoading } = useSettings();
  const [role, setRole] = useState<Role>(Role.Public);
  const [loggedInUserRole, setLoggedInUserRole] = useState<Role>(Role.None);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  
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
    document.body.style.backgroundColor = role === Role.Public ? '#1a1a2e' : '#f1f5f9'; // A lighter gray for admin
    document.body.dir = 'rtl';
  }, [settings.themeColor, role]);

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

    const newTimeoutId = setTimeout(() => {
      setCallingPatient(null);
    }, 10000);
    setCallTimeoutId(newTimeoutId);
  }, [settings.callSoundEnabled, callTimeoutId]);

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

  const handleProfilePictureSave = async (file: File) => {
    if (role !== Role.Doctor && role !== Role.Secretary) {
      toast.error('دور غير صالح لتحديث الصورة.');
      return;
    }
    const uploadToast = toast.loading('جاري رفع الصورة...');
    try {
      const downloadURL = await uploadProfilePicture(file, role);
      const settingsUpdate = role === Role.Doctor
          ? { doctorProfilePicUrl: downloadURL }
          : { secretaryProfilePicUrl: downloadURL };
  
      await updateClinicSettings(settingsUpdate);
      
      toast.success('تم تحديث صورة الملف الشخصي بنجاح!', { id: uploadToast });
      setProfileModalOpen(false);
    } catch (error) {
      console.error("Failed to save profile picture:", error);
      toast.error('فشل حفظ الصورة.', { id: uploadToast });
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
    return (
      <main className="container mx-auto p-4 md:p-6 grid grid-rows-[auto_1fr_auto] gap-6 h-screen">
        <header className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-right">
            <h1 className="text-4xl md:text-5xl font-bold text-white">{settings.clinicName}</h1>
            <p className="text-lg md:text-xl text-gray-300">{settings.doctorName} - {settings.clinicSpecialty}</p>
          </div>
          <TimeDisplay />
        </header>

        <div className="grid md:grid-cols-3 gap-6 overflow-hidden">
          <div className="md:col-span-2">
            <CurrentPatientCard 
              patient={inProgressPatient} 
              callingPatient={callingPatient}
              title="في غرفة الفحص"
              noPatientText="لا يوجد مراجع حالياً"
              callingTitle="الرجاء التوجه لغرفة الفحص"
            />
          </div>
          <div className="bg-white/10 backdrop-blur-lg p-4 rounded-2xl shadow-lg border border-white/20 flex flex-col">
            <h2 className="text-2xl font-bold text-center text-white mb-4 flex-shrink-0">قائمة الانتظار</h2>
            <ul className="space-y-3 overflow-y-auto h-full pr-2">
              {waitingPatients.length > 0 ? (
                waitingPatients.map((p, index) => (
                  <li key={p.id} className="bg-white/20 p-3 rounded-lg text-xl md:text-2xl font-semibold text-white shadow-sm flex items-center gap-3">
                    <span className="bg-blue-500 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-base flex-shrink-0">{index + 1}</span>
                    {p.name}
                  </li>
                ))
              ) : (
                <p className="text-center text-gray-400 pt-8">لا يوجد مراجعون في الانتظار.</p>
              )}
            </ul>
          </div>
        </div>

        <footer className="flex justify-between items-center gap-4">
          <Marquee text={settings.publicMessage} speed={settings.marqueeSpeed} />
          <button
            onClick={() => {
              if (loggedInUserRole !== Role.None && loggedInUserRole !== Role.Public) {
                setRole(loggedInUserRole);
              } else {
                setLoginModalOpen(true);
              }
            }}
            className="bg-white/20 backdrop-blur-lg p-3 rounded-full shadow-lg border border-white/20 hover:bg-white/30 transition flex-shrink-0"
            title={loggedInUserRole !== Role.None && loggedInUserRole !== Role.Public ? "العودة للوحة التحكم" : "تسجيل الدخول"}
          >
            {loggedInUserRole !== Role.None && loggedInUserRole !== Role.Public ? 
              <ArrowUturnLeftIcon className="w-6 h-6 text-white" /> : 
              <Cog8ToothIcon className="w-6 h-6 text-white"/>
            }
          </button>
        </footer>
        {isLoginModalOpen && <LoginModal onClose={() => setLoginModalOpen(false)} onLoginSuccess={handleLoginSuccess} settings={settings} />}
      </main>
    );
  }

  // ADMIN VIEW (Doctor or Secretary)
  return (
    <>
      <div className="h-screen flex flex-col bg-slate-100">
        <AdminHeader 
          role={role} 
          onLogout={handleLogout} 
          onShowPublicView={() => setRole(Role.Public)}
          onOpenProfileModal={() => setProfileModalOpen(true)}
          onOpenHelpModal={() => setHelpModalOpen(true)}
          profilePicUrl={role === Role.Doctor ? settings.doctorProfilePicUrl : settings.secretaryProfilePicUrl}
        />
        <main className="flex-grow p-4 md:p-6 flex flex-col lg:flex-row gap-6 overflow-hidden items-start">
          <div className="flex-grow min-w-0 w-full">
            <PatientQueueList 
                patients={patients} 
                role={role}
                onUpdateStatus={handleUpdateStatus}
                onCancel={handleCancel}
                onDeletePatient={handleDeletePatient}
                onCall={handleCallPatient}
                onReorder={handleReorder}
                callingPatient={callingPatient}
                availableServices={settings.services || []}
                onSetPatientServices={handleSetServices}
            />
          </div>
          <AdminSidebar 
            settings={settings}
            patients={patients}
            role={role}
          />
        </main>
      </div>
      
      <Toaster />
      {role === Role.Doctor && (
        <button 
            onClick={() => setSettingsModalOpen(true)} 
            className="fixed bottom-5 left-5 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition z-40"
            title="إعدادات الطبيب"
        >
            <Cog8ToothIcon className="w-6 h-6" />
        </button>
      )}
      <CallingNotification patient={notifiedPatient} onClose={() => setNotifiedPatient(null)} />
      {isSettingsModalOpen && role === Role.Doctor && <SettingsModal settings={settings} onClose={() => setSettingsModalOpen(false)} />}
      {isProfileModalOpen && (role === Role.Doctor || role === Role.Secretary) && (
          <ProfilePictureModal
              onClose={() => setProfileModalOpen(false)}
              onSave={handleProfilePictureSave}
              currentImageUrl={role === Role.Doctor ? settings.doctorProfilePicUrl : settings.secretaryProfilePicUrl}
              role={role}
          />
      )}
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