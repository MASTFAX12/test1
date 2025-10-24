import React, { useState } from 'react';
import type { PatientVisit, ClinicSettings, PatientProfile } from '../types.ts';
import { Role, PatientStatus } from '../types.ts';
import { Timestamp } from 'firebase/firestore';

import AdminSidebar from './AdminSidebar.tsx';
import AdminHeader from './AdminHeader.tsx';
import PatientQueueList from './PatientQueueList.tsx';
import StatsPanel from './StatsPanel.tsx';
import ChatPanel from './ChatPanel.tsx';
import PatientArchivePanel from './PatientArchivePanel.tsx';
import { PlusIcon } from './Icons.tsx';

interface AdminPanelProps {
  role: Role;
  settings: ClinicSettings;
  patients: PatientVisit[];
  patientProfiles: PatientProfile[];
  callingPatient: PatientVisit | null;
  onLogout: () => void;
  onShowPublicView: () => void;
  onOpenHelpModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenAddPatientModal: () => void;
  onUpdateStatus: (id: string, status: PatientStatus) => void;
  onArchive: (id: string) => void;
  onDeletePatient: (id: string) => void;
  onCall: (patient: PatientVisit) => void;
  onStopCall: () => void;
  onReorder: (patientId: string, newTimestamp: Timestamp) => void;
  unreadChatCount: number;
  onViewChat: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = (props) => {
  const [activeView, setActiveView] = useState<'queue' | 'stats' | 'chat' | 'archive'>('queue');

  const handleNavigate = (view: 'queue' | 'stats' | 'chat' | 'archive') => {
    if (view === 'chat') {
        props.onViewChat();
    }
    setActiveView(view);
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'stats':
        return <StatsPanel patients={props.patients} settings={props.settings} />;
      case 'chat':
        return <ChatPanel role={props.role} />;
      case 'archive':
        return <PatientArchivePanel patientProfiles={props.patientProfiles} allVisits={props.patients} />;
      case 'queue':
      default:
        return (
          <PatientQueueList
            patients={props.patients}
            role={props.role}
            onUpdateStatus={props.onUpdateStatus}
            onArchive={props.onArchive}
            onDeletePatient={props.onDeletePatient}
            onCall={props.onCall}
            onStopCall={props.onStopCall}
            onReorder={props.onReorder}
            callingPatient={props.callingPatient}
            settings={props.settings}
          />
        );
    }
  };

  return (
    <div className="h-screen w-screen flex bg-slate-100 overflow-hidden">
      <AdminSidebar
        activeView={activeView}
        onNavigate={handleNavigate}
        clinicName={props.settings.clinicName}
        unreadChatCount={props.unreadChatCount}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader
          role={props.role}
          onLogout={props.onLogout}
          onShowPublicView={props.onShowPublicView}
          onOpenHelpModal={props.onOpenHelpModal}
          onOpenSettingsModal={props.onOpenSettingsModal}
          clinicName={props.settings.clinicName}
        />
        <main className="flex-grow p-6 flex flex-col min-h-0">
          {renderActiveView()}
        </main>
      </div>

      {props.role === Role.Secretary && (
        <button
          onClick={props.onOpenAddPatientModal}
          className="fixed bottom-6 right-6 z-30 bg-[var(--theme-color)] text-white w-16 h-16 rounded-2xl shadow-lg hover:opacity-90 flex items-center justify-center transition transform hover:scale-110"
          title="إضافة مراجع جديد"
        >
          <PlusIcon className="w-8 h-8" />
        </button>
      )}
    </div>
  );
};

export default AdminPanel;
