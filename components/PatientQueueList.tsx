import React, { useState, useMemo, FC, DragEvent, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import type { PatientVisit, Service, CustomLineItem } from '../types.ts';
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
  PhoneIcon,
  UserIcon,
} from './Icons.tsx';
import EditablePatientCard from './EditablePatientCard.tsx';
import PaymentInputCard from './PaymentInputCard.tsx';
import ServiceSelectionModal from './ServiceSelectionModal.tsx';
import { toast } from 'react-hot-toast';
import PatientHistoryModal from './PatientHistoryModal.tsx';
import { usePrevious } from '../hooks/usePrevious.ts';
import ConfirmationModal from './ConfirmationModal.tsx';

interface PatientQueueListProps {
  patients: PatientVisit[];
  role: Role;
  onUpdateStatus: (id: string, status: PatientStatus) => void;
  onCancel: (id: string) => void;
  onDeletePatient: (id: string) => void;
  onCall: (patient: PatientVisit) => void;
  onStopCall: () => void;
  onReorder: (patientId: string, newTimestamp: Timestamp) => void;
  callingPatient: PatientVisit | null;
  availableServices: Service[];
  onSetPatientServices: (patient: PatientVisit, services: Service[], customItems: CustomLineItem[]) => void;
}

interface PatientCardProps {
  patient: PatientVisit;
  index?: number;
  role: Role;
  onUpdateStatus: (id: string, status: PatientStatus) => void;
  onSetInProgress: (id: string) => void;
  onCancel: (id: string) => void;
  onDeleteClick: (patient: PatientVisit) => void;
  onCall: (patient: PatientVisit) => void;
  onStopCall: () => void;
  onEdit: () => void;
  onSetPayment: () => void;
  onSetServices: () => void;
  onShowHistory: () => void;
  isBeingCalled?: boolean;
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
  onDeleteClick,
  onCall,
  onStopCall,
  onEdit,
  onSetPayment,
  onSetServices,
  onShowHistory,
  isBeingCalled,
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
    [PatientStatus.Waiting]: { text: 'في الانتظار', color: 'bg-blue-100 text-blue-800', borderColor: 'border-blue-400' },
    [PatientStatus.InProgress]: { text: 'قيد المعالجة', color: 'bg-red-100 text-red-800', borderColor: 'border-red-400' },
    [PatientStatus.PendingPayment]: { text: 'بانتظار الدفع', color: 'bg-yellow-100 text-yellow-800', borderColor: 'border-yellow-400' },
    [PatientStatus.Done]: { text: 'مكتمل', color: 'bg-green-100 text-green-800', borderColor: 'border-green-400' },
    [PatientStatus.Skipped]: { text: 'تم التجاوز', color: 'bg-gray-100 text-gray-800', borderColor: 'border-gray-300' },
    [PatientStatus.Cancelled]: { text: 'ملغي', color: 'bg-gray-100 text-gray-800', borderColor: 'border-gray-300' },
  };

  const { text: statusText, color: statusColor, borderColor } = statusConfig[patient.status] || {};
  const isWaiting = patient.status === PatientStatus.Waiting;

  const cardClasses = [
    'bg-white rounded-xl py-4 px-4 shadow-sm border-l-4 transition-all duration-300 relative group',
    isBeingCalled ? 'ring-2 ring-[var(--theme-color)] animate-pulse' : 'hover:shadow-lg hover:-translate-y-1',
    isDraggable ? 'cursor-grab' : '',
    isNextToPay ? 'ring-2 ring-yellow-400' : '',
    borderColor
  ].join(' ');

  const actionButtonClasses = "w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-[var(--theme-color)] hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

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
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {index !== undefined && <span className="flex-shrink-0 bg-gray-100 text-gray-600 text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center border border-gray-200">{index + 1}</span>}
          <div className="flex-grow min-w-0">
            <h3 className="font-bold text-gray-800 text-lg truncate">{patient.name}</h3>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor}`}>{statusText}</span>
            <div className="flex items-center gap-1.5">
              {isNextToPay && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400 text-yellow-900">التالي للدفع</span>}
              {isNewlyAddedToPayment && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-200 text-green-800 animate-pulse">جديد</span>}
            </div>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200/80 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-gray-600">
        <div className="flex items-center gap-1.5"><UserIcon className="w-4 h-4 text-gray-400" /><span className="font-medium">العمر:</span> {patient.age || 'غير محدد'}</div>
        {patient.phone && <div className="flex items-center gap-1.5"><PhoneIcon className="w-4 h-4 text-gray-400" /><span className="font-medium">الهاتف:</span> {patient.phone}</div>}
        <div className="flex items-center gap-1.5 col-span-2"><CurrencyDollarIcon className="w-4 h-4 text-gray-400" /><span className="font-medium">المبلغ المطلوب:</span> <span className="font-bold">{patient.requiredAmount?.toLocaleString() || 'غير محدد'}</span></div>
      </div>
      
      {!isBeingCalled && (
        <div className="absolute bottom-2 left-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/70 backdrop-blur-sm p-1 rounded-lg border border-gray-200 shadow-sm">
            {/* Actions for All Roles */}
            {patient.patientProfileId && (
              <button onMouseDown={(e) => e.stopPropagation()} title="عرض سجل المراجع" onClick={onShowHistory} className={actionButtonClasses}><ArchiveBoxIcon className="w-5 h-5" /></button>
            )}

            {/* SECRETARY ACTIONS */}
            {role === Role.Secretary && (
              <>
                {isWaiting && (
                  <>
                    <button onMouseDown={(e) => e.stopPropagation()} title="نداء" onClick={() => onCall(patient)} disabled={!!isBeingCalled} className={actionButtonClasses}><BellIcon className="w-5 h-5" /></button>
                    <button onMouseDown={(e) => e.stopPropagation()} title="إدخال للفحص" onClick={() => onSetInProgress(patient.id)} className={actionButtonClasses}><CheckIcon className="w-5 h-5" /></button>
                  </>
                )}
                {patient.status === PatientStatus.PendingPayment && (
                  <button onMouseDown={(e) => e.stopPropagation()} title="تسجيل دفعة" onClick={onSetPayment} className={actionButtonClasses}><CurrencyDollarIcon className="w-5 h-5" /></button>
                )}
                 {![PatientStatus.Done, PatientStatus.Cancelled].includes(patient.status) && (
                   <>
                      <button onMouseDown={(e) => e.stopPropagation()} title="تعديل" onClick={onEdit} disabled={isBeingCalled} className={actionButtonClasses}><PencilIcon className="w-5 h-5" /></button>
                      <button onMouseDown={(e) => e.stopPropagation()} title="أرشفة أو حذف" onClick={() => onDeleteClick(patient)} className={actionButtonClasses}><TrashIcon className="w-5 h-5" /></button>
                   </>
                 )}
              </>
            )}

            {/* DOCTOR ACTIONS */}
            {role === Role.Doctor && (
              <>
                {isWaiting && (
                  <button onMouseDown={(e) => e.stopPropagation()} title="إدخال للفحص" onClick={() => onSetInProgress(patient.id)} className={actionButtonClasses}><CheckIcon className="w-5 h-5" /></button>
                )}
                {patient.status === PatientStatus.InProgress && (
                  <>
                    <button onMouseDown={(e) => e.stopPropagation()} title="تحديد الخدمات والرسوم" onClick={onSetServices} className={actionButtonClasses}><Cog8ToothIcon className="w-5 h-5" /></button>
                    <button onMouseDown={(e) => e.stopPropagation()} title="إنهاء بدون رسوم" onClick={() => onMarkAsDone(patient)} className={actionButtonClasses}><CheckIcon className="w-5 h-5" /></button>
                  </>
                )}
                 {patient.status !== PatientStatus.Waiting && ![PatientStatus.Done, PatientStatus.Cancelled].includes(patient.status) && (
                     <button onMouseDown={(e) => e.stopPropagation()} title="إرجاع للانتظار" onClick={() => onUpdateStatus(patient.id, PatientStatus.Waiting)} className={actionButtonClasses}><ArrowUturnLeftIcon className="w-5 h-5"/></button>
                 )}
              </>
            )}
        </div>
      )}
      {isBeingCalled && (
          <div className="absolute bottom-3 left-3 w-[calc(100%-24px)] px-1">
              <button
                  onClick={(e) => {
                      e.stopPropagation();
                      onStopCall();
                  }}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-md text-sm"
              >
                  <XMarkIcon className="w-5 h-5" />
                  <span>إيقاف النداء</span>
              </button>
          </div>
      )}
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
  color: string;
}> = ({ title, children, count, isDragOver, color, ...dragProps }) => (
    <div 
      {...dragProps}
      className={`bg-slate-50 border border-slate-200/60 p-4 rounded-xl flex flex-col transition-colors duration-300 h-full ${isDragOver ? 'bg-blue-50 border-blue-300' : ''}`}
    >
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        <span className={`text-sm font-bold px-2.5 py-1 rounded-full text-white ${color}`}>{count}</span>
      </div>
      <div className="space-y-3 overflow-y-auto pr-2 -mr-2 flex-grow">
        {children}
        {count === 0 && (
            <div className={`flex items-center justify-center min-h-[120px] rounded-lg ${isDragOver ? 'border-2 border-dashed border-blue-400' : ''}`}>
              <p className="text-center text-slate-500 py-4">لا يوجد مراجعون.</p>
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
  onDeletePatient,
  onCall,
  onStopCall,
  onReorder,
  callingPatient,
  availableServices,
  onSetPatientServices,
}) => {
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
  const [paymentPatientId, setPaymentPatientId] = useState<string | null>(null);
  const [serviceSelectionPatient, setServiceSelectionPatient] = useState<PatientVisit | null>(null);
  const [historyPatient, setHistoryPatient] = useState<PatientVisit | null>(null);
  const [patientToAction, setPatientToAction] = useState<PatientVisit | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedPatient, setDraggedPatient] = useState<PatientVisit | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<PatientStatus | null>(null);
  const [newlyAddedToPayment, setNewlyAddedToPayment] = useState<Set<string>>(new Set());
  const [visibleArchivedCount, setVisibleArchivedCount] = useState(10);
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
    // Sort archived patients by creation time, newest first
    lists.completedOrCancelled.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
    return lists;
  }, [filteredPatients]);
  
  const handlePaymentSave = (patientId: string) => {
    onUpdateStatus(patientId, PatientStatus.Done);
    setPaymentPatientId(null);
    toast.success('تم تسجيل الدفعة بنجاح.');
  }

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
        onCancel(draggedPatient.id);
    }
  };

  const handleReorderDrop = (e: DragEvent<HTMLDivElement>, targetPatientId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.borderTop = "";
    if (!draggedPatient || draggedPatient.id === targetPatientId || draggedPatient.status !== PatientStatus.Waiting) return;
    
    // The list of potential neighbors does not include the dragged patient.
    const waitingList = patients.filter(p => p.status === PatientStatus.Waiting && p.id !== draggedPatient.id);
    
    const targetIndex = waitingList.findIndex(p => p.id === targetPatientId);
    if (targetIndex === -1) return;

    const targetPatientTime = waitingList[targetIndex].createdAt.toMillis();
    const prevPatientTime = targetIndex > 0 ? waitingList[targetIndex - 1].createdAt.toMillis() : targetPatientTime - 2000;
    
    const newTimeMillis = (prevPatientTime + targetPatientTime) / 2;
    onReorder(draggedPatient.id, Timestamp.fromMillis(newTimeMillis));
  };

  const handleDragOverReorder = (e: DragEvent<HTMLDivElement>) => {
    if (draggedPatient?.status === PatientStatus.Waiting) {
        e.preventDefault();
        e.currentTarget.style.borderTop = "2px solid var(--theme-color)";
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
        onDeleteClick={setPatientToAction}
        onCall={onCall}
        onStopCall={onStopCall}
        onEdit={() => setEditingPatientId(patient.id)}
        onSetPayment={() => setPaymentPatientId(patient.id)}
        onSetServices={() => setServiceSelectionPatient(patient)}
        onShowHistory={() => setHistoryPatient(patient)}
        isBeingCalled={callingPatient?.id === patient.id}
        onMarkAsDone={handleMarkAsDone}
        isDraggable={[Role.Doctor, Role.Secretary].includes(role) && ![PatientStatus.Done, PatientStatus.Cancelled].includes(patient.status)}
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
      <div className="flex flex-col h-full">
        <div className="mb-4 flex-shrink-0">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="ابحث عن مراجع بالاسم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input !pr-12"
            />
            {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"><XMarkIcon className="w-5 h-5" /></button>}
          </div>
        </div>
        <div className="grid grid-rows-1 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-grow min-h-0">
          <QueueSection title="الانتظار" count={waiting.length} isDragOver={dragOverColumn === PatientStatus.Waiting} onDragOver={(e) => handleDragOverColumn(e, PatientStatus.Waiting)} onDragLeave={handleDragLeaveColumn} onDrop={(e) => handleColumnDrop(e, PatientStatus.Waiting)} color="bg-blue-500">
            {waiting.map((p, i) => renderPatient(p, { index: i }))}
          </QueueSection>
          <QueueSection title="قيد المعالجة" count={inProgress.length} isDragOver={dragOverColumn === PatientStatus.InProgress} onDragOver={(e) => handleDragOverColumn(e, PatientStatus.InProgress)} onDragLeave={handleDragLeaveColumn} onDrop={(e) => handleColumnDrop(e, PatientStatus.InProgress)} color="bg-red-500">
            {inProgress.map(p => renderPatient(p))}
          </QueueSection>
          <QueueSection title="بانتظار الدفع" count={pendingPayment.length} isDragOver={dragOverColumn === PatientStatus.PendingPayment} onDragOver={(e) => handleDragOverColumn(e, PatientStatus.PendingPayment)} onDragLeave={handleDragLeaveColumn} onDrop={(e) => handleColumnDrop(e, PatientStatus.PendingPayment)} color="bg-yellow-500">
            {pendingPayment.map((p, i) => renderPatient(p, { isNextToPay: i === 0, isNewlyAddedToPayment: newlyAddedToPayment.has(p.id) }))}
          </QueueSection>
          <QueueSection title="الأرشيف" count={completedOrCancelled.length} isDragOver={dragOverColumn === PatientStatus.Cancelled} onDragOver={(e) => handleDragOverColumn(e, PatientStatus.Cancelled)} onDragLeave={handleDragLeaveColumn} onDrop={(e) => handleColumnDrop(e, PatientStatus.Cancelled)} color="bg-gray-500">
            {completedOrCancelled.slice(0, visibleArchivedCount).map(p => renderPatient(p))}
            {completedOrCancelled.length > visibleArchivedCount && (
                <button 
                    onClick={() => setVisibleArchivedCount(prev => prev + 10)} 
                    className="w-full mt-2 text-center text-sm font-semibold text-blue-600 hover:bg-blue-100 p-2 rounded-lg transition"
                >
                    عرض المزيد
                </button>
            )}
          </QueueSection>
        </div>
      </div>
      
      {serviceSelectionPatient && role === Role.Doctor && (
        <ServiceSelectionModal patient={serviceSelectionPatient} availableServices={availableServices} onClose={() => setServiceSelectionPatient(null)} onSave={(p, services, customItems) => { onSetPatientServices(p, services, customItems); setServiceSelectionPatient(null); }} />
      )}
      {historyPatient && (
        <PatientHistoryModal patientProfileId={historyPatient.patientProfileId} patientName={historyPatient.name} currentVisitId={historyPatient.id} onClose={() => setHistoryPatient(null)} />
      )}
      {patientToAction && (
        <ConfirmationModal
          title="تأكيد الإجراء"
          message={`ماذا تريد أن تفعل بالراجع "${patientToAction.name}"؟`}
          onClose={() => setPatientToAction(null)}
          onConfirmDelete={() => {
            onDeletePatient(patientToAction.id);
            setPatientToAction(null);
          }}
          onConfirmArchive={() => {
            onCancel(patientToAction.id);
            setPatientToAction(null);
          }}
        />
      )}
    </>
  );
};

export default PatientQueueList;