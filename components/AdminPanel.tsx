
import React, { useState } from 'react';
import type { PatientVisit, Service, CustomLineItem, ClinicSettings } from '../types.ts';
import { Role, PatientStatus } from '../types.ts';
import { Timestamp } from 'firebase/firestore';

import AdminSidebar from './AdminSidebar.tsx';
import AdminHeader from './AdminHeader.tsx';
import PatientQueueList from './PatientQueueList.tsx';
import StatsPanel from './StatsPanel.tsx';
import ChatPanel from './ChatPanel.tsx';
import { PlusIcon } from './Icons.tsx';

interface AdminPanelProps {
  role: Role;
  settings: ClinicSettings;
  patients: PatientVisit[];
  callingPatient: PatientVisit | null;
  onLogout: () => void;
  onShowPublicView: () => void;
  onOpenProfileModal: () => void;
  onOpenHelpModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenAddPatientModal: () => void;
  onUpdateStatus: (id: string, status: PatientStatus) => void;
  onCancel: (id: string) => void;
  onDeletePatient: (id: string) => void;
  onCall: (patient: PatientVisit) => void;
  onReorder: (patientId: string, newTimestamp: Timestamp) => void;
  onSetPatientServices: (patient: PatientVisit, services: Service[], customItems: CustomLineItem[]) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = (props) => {
  const [activeView, setActiveView] = useState<'queue' | 'stats' | 'chat'>('queue');

  const renderActiveView = () => {
    switch (activeView) {
      case 'stats':
        return <StatsPanel patients={props.patients} />;
      case 'chat':
        return <ChatPanel role={props.role} />;
      case 'queue':
      default:
        return (
          <PatientQueueList
            patients={props.patients}
            role={props.role}
            onUpdateStatus={props.onUpdateStatus}
            onCancel={props.onCancel}
            onDeletePatient={props.onDeletePatient}
            onCall={props.onCall}
            onReorder={props.onReorder}
            callingPatient={props.callingPatient}
            availableServices={props.settings.services || []}
            onSetPatientServices={props.onSetPatientServices}
          />
        );
    }
  };

  return (
    <div className="h-screen w-screen flex bg-slate-100 overflow-hidden">
      <AdminSidebar
        activeView={activeView}
        onNavigate={setActiveView}
        clinicName={props.settings.clinicName}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader
          role={props.role}
          onLogout={props.onLogout}
          onShowPublicView={props.onShowPublicView}
          onOpenProfileModal={props.onOpenProfileModal}
          onOpenHelpModal={props.onOpenHelpModal}
          onOpenSettingsModal={props.onOpenSettingsModal}
          profilePicUrl={props.role === Role.Doctor ? props.settings.doctorProfilePicUrl : props.settings.secretaryProfilePicUrl}
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
