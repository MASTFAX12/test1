import React, { useState, useMemo, FC, DragEvent } from 'react';
import { Timestamp } from 'firebase/firestore';
import type { PatientVisit, Service } from '../types.ts';
import { PatientStatus, Role } from '../types.ts';
import {
  BellIcon,
  CheckIcon,
  PencilIcon,
  CurrencyDollarIcon,
  ArrowUturnLeftIcon,
  Cog8ToothIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArchiveBoxIcon,
  XMarkIcon,
  PhoneIcon
} from './Icons.tsx';
import EditablePatientCard from './EditablePatientCard.tsx';
import PaymentInputCard from './PaymentInputCard.tsx';
import ServiceSelectionModal from './ServiceSelectionModal.tsx';
import { toast } from 'react-hot-toast';
import PatientHistoryModal from './PatientHistoryModal.tsx';

interface PatientQueueListProps {
  patients: PatientVisit[];
  role: Role;
  onUpdateStatus: (id: string, status: PatientStatus) => void;
  onCancel: (id: string) => void;
  onCall: (patient: PatientVisit) => void;
  onReorder: (patientId: string, newTimestamp: Timestamp) => void;
  callingPatient: PatientVisit | null;
  availableServices: Service[];
  onSetPatientServices: (patient: PatientVisit, services: Service[]) => void;
}

interface PatientCardProps {
  patient: PatientVisit;
  index?: number;
  role: Role;
  onUpdateStatus: (id: string, status: PatientStatus) => void;
  onCancel: (id: string) => void;
  onCall: (patient: PatientVisit) => void;
  onEdit: () => void;
  onSetPayment: () => void;
  onSetServices: () => void;
  onShowHistory: () => void;
  isBeingCalled?: boolean;
  onReturnToWaiting: (patientId: string) => void;
  onMarkAsDone: (patient: PatientVisit) => void;
  isDraggable?: boolean;
  onDragStart?: (e: DragEvent<HTMLDivElement>, patientId: string) => void;
  onDragOver?: (e: DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: DragEvent<HTMLDivElement>, patientId: string) => void;
  onDragLeave?: (e: DragEvent<HTMLDivElement>) => void;
  isNextToPay?: boolean;
}

const PatientCard: FC<PatientCardProps> = ({
  patient,
  index,
  role,
  onUpdateStatus,
  onCancel,
  onCall,
  onEdit,
  onSetPayment,
  onSetServices,
  onShowHistory,
  isBeingCalled,
  onReturnToWaiting,
  onMarkAsDone,
  isDraggable,
  onDragStart,
  onDragOver,
  onDrop,
  onDragLeave,
  isNextToPay
}) => {
  const statusConfig = {
    [PatientStatus.Waiting]: { text: 'في الانتظار', color: 'bg-blue-100 text-blue-800' },
    [PatientStatus.InProgress]: { text: 'قيد المعالجة', color: 'bg-red-100 text-red-800' },
    [PatientStatus.PendingPayment]: { text: 'بانتظار الدفع', color: 'bg-yellow-100 text-yellow-800' },
    [PatientStatus.Done]: { text: 'مكتمل', color: 'bg-green-100 text-green-800' },
    [PatientStatus.Skipped]: { text: 'تم التجاوز', color: 'bg-gray-100 text-gray-800' },
    [PatientStatus.Cancelled]: { text: 'ملغي', color: 'bg-gray-100 text-gray-800' },
  };

  const { text: statusText, color: statusColor } = statusConfig[patient.status] || {};
  const isWaiting = patient.status === PatientStatus.Waiting;

  const cardClasses = [
    'bg-white rounded-xl p-4 mb-3 shadow-md border-l-4 transition-all duration-300',
    isBeingCalled ? 'border-blue-500 ring-2 ring-blue-500 animate-pulse' : 'border-transparent',
    isDraggable ? 'cursor-grab' : '',
    isNextToPay ? 'border-yellow-400 ring-2 ring-yellow-400' : ''
  ].join(' ');

  return (
    <div 
      className={cardClasses}
      draggable={isDraggable}
      onDragStart={(e) => onDragStart?.(e, patient.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop?.(e, patient.id)}
      onDragLeave={onDragLeave}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {index !== undefined && <span className="flex-shrink-0 bg-gray-200 text-gray-700 text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center">{index + 1}</span>}
          <div className="flex-grow">
            <h3 className="font-bold text-gray-800 text-lg">{patient.name}</h3>
            {patient.reason && patient.showDetailsToPublic && <p className="text-sm text-gray-500">{patient.reason}</p>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor}`}>{statusText}</span>
            {isNextToPay && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400 text-yellow-900">التالي للدفع</span>}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600 flex-wrap gap-2">
        <p>العمر: {patient.age || 'غير محدد'}</p>
        {patient.phone && (
            <div className="flex items-center gap-1">
                <PhoneIcon className="w-4 h-4 text-gray-400" />
                <span>{patient.phone}</span>
            </div>
        )}
        <p>المبلغ المطلوب: <span className="font-bold">{patient.requiredAmount?.toLocaleString() || 'غير محدد'}</span></p>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200 flex flex-wrap gap-2 justify-end items-center">
        <div className="flex flex-wrap gap-2 justify-end">
          {/* Actions for All Roles */}
          {patient.patientProfileId && (
            <button title="عرض سجل المراجع" onClick={onShowHistory} className="action-btn bg-gray-500 hover:bg-gray-600"><ArchiveBoxIcon className="w-4 h-4" /></button>
          )}

          {/* Actions for Secretary */}
          {role === Role.Secretary && (
            <>
              {isWaiting && (
                <>
                  <button title="نداء" onClick={() => onCall(patient)} disabled={!!isBeingCalled} className="action-btn bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400"><BellIcon className="w-4 h-4" /></button>
                  <button title="إدخال للفحص" onClick={() => onUpdateStatus(patient.id, PatientStatus.InProgress)} className="action-btn bg-green-500 hover:bg-green-600"><CheckIcon className="w-4 h-4" /></button>
                </>
              )}
              {patient.status === PatientStatus.PendingPayment && (
                <button title="تسجيل دفعة" onClick={onSetPayment} className="action-btn bg-yellow-500 hover:bg-yellow-600"><CurrencyDollarIcon className="w-4 h-4" /></button>
              )}
              {patient.status === PatientStatus.InProgress && (
                  <button title="إرجاع للانتظار" onClick={() => onReturnToWaiting(patient.id)} className="action-btn bg-gray-500 hover:bg-gray-600"><ArrowUturnLeftIcon className="w-4 h-4"/></button>
              )}
               <button title="تعديل" onClick={onEdit} className="action-btn bg-gray-500 hover:bg-gray-600"><PencilIcon className="w-4 h-4" /></button>
               {!isWaiting && <button title="إلغاء الموعد" onClick={() => onCancel(patient.id)} className="action-btn bg-red-500 hover:bg-red-600"><TrashIcon className="w-4 h-4" /></button>}
            </>
          )}
          {/* Actions for Doctor */}
          {role === Role.Doctor && (
            <>
              {isWaiting && (
                <button title="إدخال للفحص" onClick={() => onUpdateStatus(patient.id, PatientStatus.InProgress)} className="action-btn bg-green-500 hover:bg-green-600"><CheckIcon className="w-4 h-4" /></button>
              )}
              {patient.status === PatientStatus.InProgress && (
                <>
                  <button title="تحديد الخدمات والرسوم" onClick={onSetServices} className="action-btn bg-blue-500 hover:bg-blue-600"><Cog8ToothIcon className="w-4 h-4" /></button>
                  <button title="إنهاء بدون رسوم" onClick={() => onMarkAsDone(patient)} className="action-btn bg-green-500 hover:bg-green-600"><CheckIcon className="w-4 h-4" /></button>
                </>
              )}
               {patient.status !== PatientStatus.InProgress && patient.status !== PatientStatus.Waiting && (
                   <button title="إرجاع للانتظار" onClick={() => onUpdateStatus(patient.id, PatientStatus.Waiting)} className="action-btn bg-gray-500 hover:bg-gray-600"><ArrowUturnLeftIcon className="w-4 h-4"/></button>
               )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const QueueSection: FC<{ title: string; children: React.ReactNode; count: number; }> = ({ title, children, count }) => (
    <div className="bg-gray-50/50 backdrop-blur-sm p-4 rounded-xl shadow-inner border border-gray-200">
      <h2 className="text-lg font-bold text-gray-700 mb-3">{title} ({count})</h2>
      <div className="space-y-3">{children}</div>
      {count === 0 && (
          <p className="text-center text-gray-500 py-4">لا يوجد مراجعون في هذه القائمة.</p>
      )}
    </div>
);


const PatientQueueList: FC<PatientQueueListProps> = ({
  patients,
  role,
  onUpdateStatus,
  onCancel,
  onCall,
  onReorder,
  callingPatient,
  availableServices,
  onSetPatientServices,
}) => {
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
  const [paymentPatientId, setPaymentPatientId] = useState<string | null>(null);
  const [serviceSelectionPatient, setServiceSelectionPatient] = useState<PatientVisit | null>(null);
  const [historyPatient, setHistoryPatient] = useState<PatientVisit | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedPatientId, setDraggedPatientId] = useState<string | null>(null);

  const filteredPatients = useMemo(() => {
    if (!searchTerm) return patients;
    const lowercasedFilter = searchTerm.toLowerCase();
    return patients.filter(patient => 
      patient.name.toLowerCase().includes(lowercasedFilter)
    );
  }, [patients, searchTerm]);


  const { waiting, inProgress, pendingPayment, completedOrCancelled } = useMemo(() => {
    const lists = filteredPatients.reduce((acc, p) => {
      if (p.status === PatientStatus.Waiting) acc.waiting.push(p);
      else if (p.status === PatientStatus.InProgress) acc.inProgress.push(p);
      else if (p.status === PatientStatus.PendingPayment) acc.pendingPayment.push(p);
      else acc.completedOrCancelled.push(p);
      return acc;
    }, { waiting: [], inProgress: [], pendingPayment: [], completedOrCancelled: [] } as Record<string, PatientVisit[]>);

    // Sort pendingPayment list to show the most recently sent patient at the top
    lists.pendingPayment.sort((a, b) => {
        const timeA = a.sentToPaymentAt?.toMillis() || 0;
        const timeB = b.sentToPaymentAt?.toMillis() || 0;
        return timeB - timeA; // Descending order
    });

    return lists;
  }, [filteredPatients]);
  
  const handlePaymentSave = (patientId: string) => {
    onUpdateStatus(patientId, PatientStatus.Done);
    setPaymentPatientId(null);
    toast.success('تم تسجيل الدفعة بنجاح.');
  }

  const handleReturnToWaiting = (patientId: string) => {
    onUpdateStatus(patientId, PatientStatus.Waiting);
  };

  const handleMarkAsDone = (patient: PatientVisit) => {
    if (window.confirm(`هل أنت متأكد من إنهاء مراجعة "${patient.name}"؟`)) {
      onUpdateStatus(patient.id, PatientStatus.Done);
    }
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: DragEvent<HTMLDivElement>, patientId: string) => {
    setDraggedPatientId(patientId);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.style.opacity = '0.5';
  };
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.borderTop = "2px solid #3b82f6";
  };
  
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.borderTop = "";
  };
  
  const handleDrop = (e: DragEvent<HTMLDivElement>, targetPatientId: string) => {
    e.preventDefault();
    e.currentTarget.style.borderTop = "";
    if (!draggedPatientId || draggedPatientId === targetPatientId) {
      setDraggedPatientId(null);
      return;
    }
    
    const originalWaitingList = patients.filter(p => p.status === PatientStatus.Waiting);
    const draggedIndex = originalWaitingList.findIndex(p => p.id === draggedPatientId);
    const targetIndex = originalWaitingList.findIndex(p => p.id === targetPatientId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    let newTimeMillis: number;
    const targetPatientTime = originalWaitingList[targetIndex].createdAt.toMillis();
    
    if (draggedIndex < targetIndex) { // Dragging down
      const nextPatientTime = targetIndex + 1 < originalWaitingList.length ? originalWaitingList[targetIndex + 1].createdAt.toMillis() : targetPatientTime + 2000;
      newTimeMillis = (targetPatientTime + nextPatientTime) / 2;
    } else { // Dragging up
      const prevPatientTime = targetIndex > 0 ? originalWaitingList[targetIndex - 1].createdAt.toMillis() : targetPatientTime - 2000;
      newTimeMillis = (targetPatientTime + prevPatientTime) / 2;
    }

    onReorder(draggedPatientId, Timestamp.fromMillis(newTimeMillis));
    setDraggedPatientId(null);
  };

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1';
  };

  const renderPatient = (patient: PatientVisit, options: {index?: number, isWaitingList?: boolean, isNextToPay?: boolean} = {}) => {
    if (editingPatientId === patient.id && role === Role.Secretary) {
      return (
        <EditablePatientCard
          key={patient.id}
          patient={patient}
          onCancel={() => setEditingPatientId(null)}
          onSave={() => setEditingPatientId(null)}
          isBeingCalled={callingPatient?.id === patient.id}
        />
      );
    }
    if (paymentPatientId === patient.id && role === Role.Secretary) {
        return (
            <PaymentInputCard
                key={patient.id}
                patient={patient}
                onCancel={() => setPaymentPatientId(null)}
                onSave={handlePaymentSave}
            />
        )
    }
    return (
      <PatientCard
        key={patient.id}
        patient={patient}
        index={options.index}
        role={role}
        onUpdateStatus={onUpdateStatus}
        onCancel={onCancel}
        onCall={onCall}
        onEdit={() => setEditingPatientId(patient.id)}
        onSetPayment={() => setPaymentPatientId(patient.id)}
        onSetServices={() => setServiceSelectionPatient(patient)}
        onShowHistory={() => setHistoryPatient(patient)}
        isBeingCalled={callingPatient?.id === patient.id}
        onReturnToWaiting={handleReturnToWaiting}
        onMarkAsDone={handleMarkAsDone}
        isDraggable={options.isWaitingList && role === Role.Secretary}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        isNextToPay={options.isNextToPay}
      />
    );
  };

  return (
    <>
      <div className="mb-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="ابحث عن مراجع بالاسم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-shadow duration-200"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <QueueSection title="الانتظار" count={waiting.length}>
          {waiting.map((p, i) => renderPatient(p, { index: i, isWaitingList: true }))}
        </QueueSection>
        <QueueSection title="قيد المعالجة" count={inProgress.length}>
          {inProgress.map(p => renderPatient(p))}
        </QueueSection>
        <QueueSection title="بانتظار الدفع" count={pendingPayment.length}>
          {pendingPayment.map((p, i) => renderPatient(p, { isNextToPay: i === 0 }))}
        </QueueSection>
        <QueueSection title="الأرشيف" count={completedOrCancelled.length}>
          {completedOrCancelled.map(p => renderPatient(p))}
        </QueueSection>
      </div>
      
      {serviceSelectionPatient && role === Role.Doctor && (
        <ServiceSelectionModal 
            patient={serviceSelectionPatient}
            availableServices={availableServices}
            onClose={() => setServiceSelectionPatient(null)}
            onSave={(p, services) => {
                onSetPatientServices(p, services);
                setServiceSelectionPatient(null);
            }}
        />
      )}
      {historyPatient && (
        <PatientHistoryModal
            patientProfileId={historyPatient.patientProfileId}
            patientName={historyPatient.name}
            currentVisitId={historyPatient.id}
            onClose={() => setHistoryPatient(null)}
        />
      )}
    </>
  );
};

export default PatientQueueList;
