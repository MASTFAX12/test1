import React, { useState, useMemo, FC, DragEvent, useEffect } from 'react';
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
import { usePrevious } from '../hooks/usePrevious.ts';

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
  onSetInProgress: (id: string) => void;
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
  onDragStart?: (e: DragEvent<HTMLDivElement>, patient: PatientVisit) => void;
  onDragEnd?: (e: DragEvent<HTMLDivElement>) => void;
  onDragOverReorder?: (e: DragEvent<HTMLDivElement>) => void;
  onDropReorder?: (e: DragEvent<HTMLDivElement>, patientId: string) => void;
  onDragLeaveReorder?: (e: DragEvent<HTMLDivElement>) => void;
  isNextToPay?: boolean;
  isNewlyAddedToPayment?: boolean;
}

const PatientCard: FC<PatientCardProps> = ({
  patient,
  index,
  role,
  onUpdateStatus,
  onSetInProgress,
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
  onDragEnd,
  onDragOverReorder,
  onDropReorder,
  onDragLeaveReorder,
  isNextToPay,
  isNewlyAddedToPayment
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
      onDragStart={(e) => onDragStart?.(e, patient)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOverReorder}
      onDrop={(e) => onDropReorder?.(e, patient.id)}
      onDragLeave={onDragLeaveReorder}
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
            {isNewlyAddedToPayment && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-200 text-green-800 animate-pulse">جديد للدفع</span>}
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
                  <button title="إدخال للفحص" onClick={() => onSetInProgress(patient.id)} className="action-btn bg-green-500 hover:bg-green-600"><CheckIcon className="w-4 h-4" /></button>
                </>
              )}
              {patient.status === PatientStatus.PendingPayment && (
                <button title="تسجيل دفعة" onClick={onSetPayment} className="action-btn bg-yellow-500 hover:bg-yellow-600"><CurrencyDollarIcon className="w-4 h-4" /></button>
              )}
              {patient.status === PatientStatus.InProgress && (
                  <button title="إرجاع للانتظار" onClick={() => onReturnToWaiting(patient.id)} className="action-btn bg-gray-500 hover:bg-gray-600"><ArrowUturnLeftIcon className="w-4 h-4"/></button>
              )}
               <button title="تعديل" onClick={onEdit} disabled={isBeingCalled} className="action-btn bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed"><PencilIcon className="w-4 h-4" /></button>
               {![PatientStatus.Done, PatientStatus.Cancelled].includes(patient.status) && <button title="إلغاء الموعد" onClick={() => onCancel(patient.id)} className="action-btn bg-red-500 hover:bg-red-600"><TrashIcon className="w-4 h-4" /></button>}
            </>
          )}
          {/* Actions for Doctor */}
          {role === Role.Doctor && (
            <>
              {isWaiting && (
                <button title="إدخال للفحص" onClick={() => onSetInProgress(patient.id)} className="action-btn bg-green-500 hover:bg-green-600"><CheckIcon className="w-4 h-4" /></button>
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

const QueueSection: FC<{ 
  title: string; 
  children: React.ReactNode; 
  count: number;
  isDragOver: boolean;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: DragEvent<HTMLDivElement>) => void;
}> = ({ title, children, count, isDragOver, ...dragProps }) => (
    <div 
      {...dragProps}
      className={`bg-slate-200/50 p-3 rounded-xl shadow-inner border border-slate-300/50 flex flex-col transition-colors duration-300 ${isDragOver ? 'bg-blue-100 border-blue-300' : ''}`}
    >
      <h2 className="text-lg font-bold text-slate-700 mb-3 flex-shrink-0 px-1">{title} ({count})</h2>
      <div className="space-y-3 overflow-y-auto pr-2 -mr-2 max-h-[calc(100vh-280px)]">
        {children}
        {count === 0 && (
            <div className={`flex items-center justify-center min-h-[100px] rounded-lg ${isDragOver ? 'border-2 border-dashed border-blue-400' : ''}`}>
              <p className="text-center text-slate-500 py-4">لا يوجد مراجعون في هذه القائمة.</p>
            </div>
        )}
      </div>
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
  const [draggedPatient, setDraggedPatient] = useState<PatientVisit | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<PatientStatus | null>(null);
  const [newlyAddedToPayment, setNewlyAddedToPayment] = useState<Set<string>>(new Set());
  const prevPatients = usePrevious(patients);

  useEffect(() => {
    if (!prevPatients || role !== Role.Secretary) return;
    const newPendingPatientIds = new Set<string>();
    patients.forEach(currentPatient => {
      if (currentPatient.status === PatientStatus.PendingPayment) {
        const prevVersion = prevPatients.find(p => p.id === currentPatient.id);
        if (prevVersion && prevVersion.status !== PatientStatus.PendingPayment) {
          newPendingPatientIds.add(currentPatient.id);
        }
      }
    });
    if (newPendingPatientIds.size > 0) {
      setNewlyAddedToPayment(prevSet => {
          const newSet = new Set(prevSet);
          newPendingPatientIds.forEach(id => newSet.add(id));
          return newSet;
      });
      toast('تم إرسال مراجع جديد للدفع.', { icon: '💰', position: 'bottom-left' });
      const timer = setTimeout(() => { setNewlyAddedToPayment(new Set()); }, 10000); 
      return () => clearTimeout(timer);
    }
  }, [patients, prevPatients, role]);

  const filteredPatients = useMemo(() => {
    if (!searchTerm) return patients;
    const lowercasedFilter = searchTerm.toLowerCase();
    return patients.filter(patient => patient.name.toLowerCase().includes(lowercasedFilter));
  }, [patients, searchTerm]);


  const { waiting, inProgress, pendingPayment, completedOrCancelled } = useMemo(() => {
    const lists = filteredPatients.reduce((acc, p) => {
      if (p.status === PatientStatus.Waiting) acc.waiting.push(p);
      else if (p.status === PatientStatus.InProgress) acc.inProgress.push(p);
      else if (p.status === PatientStatus.PendingPayment) acc.pendingPayment.push(p);
      else acc.completedOrCancelled.push(p);
      return acc;
    }, { waiting: [], inProgress: [], pendingPayment: [], completedOrCancelled: [] } as Record<string, PatientVisit[]>);
    lists.pendingPayment.sort((a, b) => (b.sentToPaymentAt?.toMillis() || 0) - (a.sentToPaymentAt?.toMillis() || 0));
    return lists;
  }, [filteredPatients]);
  
  const handlePaymentSave = (patientId: string) => {
    onUpdateStatus(patientId, PatientStatus.Done);
    setPaymentPatientId(null);
    toast.success('تم تسجيل الدفعة بنجاح.');
  }

  const handleReturnToWaiting = (patientId: string) => onUpdateStatus(patientId, PatientStatus.Waiting);

  const handleSetInProgress = (patientId: string) => {
    if (inProgress.length > 0 && !inProgress.some(p => p.id === patientId)) {
      toast.error('يوجد مراجع قيد الفحص حالياً. لا يمكن إدخال مراجع آخر.');
      return;
    }
    onUpdateStatus(patientId, PatientStatus.InProgress);
  };

  const handleMarkAsDone = (patient: PatientVisit) => {
    if (window.confirm(`هل أنت متأكد من إنهاء مراجعة "${patient.name}"؟`)) {
      onUpdateStatus(patient.id, PatientStatus.Done);
    }
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, patient: PatientVisit) => {
    setDraggedPatient(patient);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.style.opacity = '0.5';
  };
  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1';
    setDraggedPatient(null);
    setDragOverColumn(null);
  };
  const handleDragOverColumn = (e: DragEvent<HTMLDivElement>, status: PatientStatus) => {
    e.preventDefault();
    if (draggedPatient && draggedPatient.status !== status) setDragOverColumn(status);
  };
  const handleDragLeaveColumn = () => setDragOverColumn(null);

  const handleColumnDrop = (e: DragEvent<HTMLDivElement>, targetStatus: PatientStatus) => {
    e.preventDefault();
    handleDragLeaveColumn();
    if (!draggedPatient || draggedPatient.status === targetStatus) return;
    if (role === Role.Secretary && targetStatus === PatientStatus.PendingPayment) {
        toast.error('لا يمكن نقل المراجع إلى "بانتظار الدفع" يدوياً.');
        return;
    }
    if ([PatientStatus.Done, PatientStatus.Cancelled].includes(draggedPatient.status)) {
        toast.error('لا يمكن إعادة مراجع من الأرشيف.');
        return;
    }
    if (targetStatus === PatientStatus.InProgress) {
        handleSetInProgress(draggedPatient.id);
    } else if (targetStatus === PatientStatus.Waiting) {
        onUpdateStatus(draggedPatient.id, PatientStatus.Waiting);
    } else if (targetStatus === PatientStatus.Cancelled) {
        if (window.confirm(`هل أنت متأكد من إلغاء مراجعة "${draggedPatient.name}"؟`)) {
            onCancel(draggedPatient.id);
        }
    }
  };

  const handleReorderDrop = (e: DragEvent<HTMLDivElement>, targetPatientId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.borderTop = "";
    if (!draggedPatient || draggedPatient.id === targetPatientId || draggedPatient.status !== PatientStatus.Waiting) return;
    const originalWaitingList = patients.filter(p => p.status === PatientStatus.Waiting);
    const draggedIndex = originalWaitingList.findIndex(p => p.id === draggedPatient.id);
    const targetIndex = originalWaitingList.findIndex(p => p.id === targetPatientId);
    if (draggedIndex === -1 || targetIndex === -1) return;
    let newTimeMillis: number;
    const targetPatientTime = originalWaitingList[targetIndex].createdAt.toMillis();
    if (draggedIndex < targetIndex) {
      const nextPatientTime = targetIndex + 1 < originalWaitingList.length ? originalWaitingList[targetIndex + 1].createdAt.toMillis() : targetPatientTime + 2000;
      newTimeMillis = (targetPatientTime + nextPatientTime) / 2;
    } else {
      const prevPatientTime = targetIndex > 0 ? originalWaitingList[targetIndex - 1].createdAt.toMillis() : targetPatientTime - 2000;
      newTimeMillis = (targetPatientTime + prevPatientTime) / 2;
    }
    onReorder(draggedPatient.id, Timestamp.fromMillis(newTimeMillis));
  };

  const handleDragOverReorder = (e: DragEvent<HTMLDivElement>) => {
    if (draggedPatient?.status === PatientStatus.Waiting) {
        e.preventDefault();
        e.currentTarget.style.borderTop = "2px solid #3b82f6";
    }
  };
  const handleDragLeaveReorder = (e: DragEvent<HTMLDivElement>) => e.currentTarget.style.borderTop = "";

  const renderPatient = (patient: PatientVisit, options: {index?: number, isNextToPay?: boolean, isNewlyAddedToPayment?: boolean} = {}) => {
    if (editingPatientId === patient.id && role === Role.Secretary) {
      return <EditablePatientCard key={patient.id} patient={patient} onCancel={() => setEditingPatientId(null)} onSave={() => setEditingPatientId(null)} isBeingCalled={callingPatient?.id === patient.id} />;
    }
    if (paymentPatientId === patient.id && role === Role.Secretary) {
        return <PaymentInputCard key={patient.id} patient={patient} onCancel={() => setPaymentPatientId(null)} onSave={handlePaymentSave} />;
    }
    return (
      <PatientCard
        key={patient.id}
        patient={patient}
        index={options.index}
        role={role}
        onUpdateStatus={onUpdateStatus}
        onSetInProgress={handleSetInProgress}
        onCancel={onCancel}
        onCall={onCall}
        onEdit={() => setEditingPatientId(patient.id)}
        onSetPayment={() => setPaymentPatientId(patient.id)}
        onSetServices={() => setServiceSelectionPatient(patient)}
        onShowHistory={() => setHistoryPatient(patient)}
        isBeingCalled={callingPatient?.id === patient.id}
        onReturnToWaiting={handleReturnToWaiting}
        onMarkAsDone={handleMarkAsDone}
        isDraggable={role === Role.Secretary && ![PatientStatus.Done, PatientStatus.Cancelled].includes(patient.status)}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDropReorder={handleReorderDrop}
        onDragOverReorder={handleDragOverReorder}
        onDragLeaveReorder={handleDragLeaveReorder}
        isNextToPay={options.isNextToPay}
        isNewlyAddedToPayment={options.isNewlyAddedToPayment}
      />
    );
  };

  return (
    <>
      <div className="flex flex-col">
        <div className="mb-4 flex-shrink-0">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="ابحث عن مراجع بالاسم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-shadow duration-200"
            />
            {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"><XMarkIcon className="w-5 h-5" /></button>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QueueSection title="الانتظار" count={waiting.length} isDragOver={dragOverColumn === PatientStatus.Waiting} onDragOver={(e) => handleDragOverColumn(e, PatientStatus.Waiting)} onDragLeave={handleDragLeaveColumn} onDrop={(e) => handleColumnDrop(e, PatientStatus.Waiting)}>
            {waiting.map((p, i) => renderPatient(p, { index: i }))}
          </QueueSection>
          <QueueSection title="قيد المعالجة" count={inProgress.length} isDragOver={dragOverColumn === PatientStatus.InProgress} onDragOver={(e) => handleDragOverColumn(e, PatientStatus.InProgress)} onDragLeave={handleDragLeaveColumn} onDrop={(e) => handleColumnDrop(e, PatientStatus.InProgress)}>
            {inProgress.map(p => renderPatient(p))}
          </QueueSection>
          <QueueSection title="بانتظار الدفع" count={pendingPayment.length} isDragOver={dragOverColumn === PatientStatus.PendingPayment} onDragOver={(e) => handleDragOverColumn(e, PatientStatus.PendingPayment)} onDragLeave={handleDragLeaveColumn} onDrop={(e) => handleColumnDrop(e, PatientStatus.PendingPayment)}>
            {pendingPayment.map((p, i) => renderPatient(p, { isNextToPay: i === 0, isNewlyAddedToPayment: newlyAddedToPayment.has(p.id) }))}
          </QueueSection>
          <QueueSection title="الأرشيف" count={completedOrCancelled.length} isDragOver={dragOverColumn === PatientStatus.Cancelled} onDragOver={(e) => handleDragOverColumn(e, PatientStatus.Cancelled)} onDragLeave={handleDragLeaveColumn} onDrop={(e) => handleColumnDrop(e, PatientStatus.Cancelled)}>
            {completedOrCancelled.map(p => renderPatient(p))}
          </QueueSection>
        </div>
      </div>
      
      {serviceSelectionPatient && role === Role.Doctor && (
        <ServiceSelectionModal patient={serviceSelectionPatient} availableServices={availableServices} onClose={() => setServiceSelectionPatient(null)} onSave={(p, services) => { onSetPatientServices(p, services); setServiceSelectionPatient(null); }} />
      )}
      {historyPatient && (
        <PatientHistoryModal patientProfileId={historyPatient.patientProfileId} patientName={historyPatient.name} currentVisitId={historyPatient.id} onClose={() => setHistoryPatient(null)} />
      )}
    </>
  );
};

export default PatientQueueList;