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
  SpinnerIcon,
  ClipboardDocumentListIcon,
} from './Icons.tsx';
import EditablePatientCard from './EditablePatientCard.tsx';
import ServiceSelectionModal from './ServiceSelectionModal.tsx';
import { toast } from 'react-hot-toast';
import PatientHistoryModal from './PatientHistoryModal.tsx';
import { usePrevious } from '../hooks/usePrevious.ts';
import ConfirmationModal from './ConfirmationModal.tsx';
import { updatePatientDetails, updatePatientStatus, archiveVisitsByIds } from '../services/firebase.ts';

interface PaymentModalProps {
  patient: PatientVisit;
  onClose: () => void;
  onSave: (patientId: string, amountPaid: number) => Promise<void>;
}

const PaymentModal: FC<PaymentModalProps> = ({ patient, onClose, onSave }) => {
    const [amount, setAmount] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    
    const requiredAmount = patient.requiredAmount || 0;
    const amountNum = parseFloat(amount) || 0;
    const difference = amountNum - requiredAmount;

    const handleSave = async () => {
        if (!amount || isNaN(amountNum) || amountNum < 0) {
            toast.error('الرجاء إدخال مبلغ صحيح.');
            return;
        }
        setIsSaving(true);
        await onSave(patient.id, amountNum);
        setIsSaving(false);
    };

    const handlePayFull = () => {
        setAmount(requiredAmount.toString());
    };

    const getDifferenceText = () => {
        if (!amount) return null;
        if (difference === 0) return <p className="text-green-600 font-semibold animate-fade-in">المبلغ مطابق تماماً</p>;
        if (difference < 0) return <p className="text-orange-600 font-semibold animate-fade-in">المبلغ المتبقي: {(-difference).toLocaleString()} د.ع</p>;
        if (difference > 0) return <p className="text-indigo-600 font-semibold animate-fade-in">الباقي (للمراجع): {difference.toLocaleString()} د.ع</p>;
        return null;
    }

    return (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-slate-100 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
                <header className="flex justify-between items-center p-5 border-b border-slate-200">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">تسجيل دفعة</h2>
                        <p className="text-sm text-slate-500">للمراجع: {patient.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200/60 transition-colors">
                        <XMarkIcon className="w-6 h-6 text-slate-600" />
                    </button>
                </header>
                <div className="p-6 flex-grow space-y-5">
                    <div className="bg-gradient-to-br from-[var(--theme-color)] to-blue-400 text-white text-center p-5 rounded-2xl shadow-lg">
                        <p className="text-sm font-semibold opacity-80">المبلغ المطلوب</p>
                        <p className="text-5xl font-extrabold tracking-tight mt-1">{requiredAmount.toLocaleString()} <span className="text-3xl font-bold align-middle">د.ع</span></p>
                    </div>

                    <div className="space-y-3">
                        <label htmlFor="paymentAmount" className="block text-sm font-medium text-slate-700 mb-1 text-center">أدخل المبلغ المدفوع</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                                <CurrencyDollarIcon className="w-6 h-6"/>
                            </div>
                            <input
                                id="paymentAmount"
                                type="text"
                                inputMode="decimal"
                                value={amount}
                                onChange={(e) => { if (/^\d*\.?\d*$/.test(e.target.value)) setAmount(e.target.value); }}
                                className="form-input !pl-12 !pr-4 text-3xl text-center font-bold !py-3 !rounded-lg border border-slate-300"
                                placeholder="0"
                                autoFocus
                            />
                        </div>
                    </div>
                    
                    <button 
                        onClick={handlePayFull} 
                        className="w-full text-center text-sm font-bold text-blue-800 bg-blue-100 hover:bg-blue-200/70 p-3 rounded-lg transition-colors border border-blue-200/80"
                    >
                        دفع المبلغ كاملاً
                    </button>
                    
                    <div className="text-center h-6 text-sm">
                        {getDifferenceText()}
                    </div>
                </div>

                <footer className="p-4 bg-slate-200/70 border-t border-slate-200 flex-shrink-0 flex justify-end gap-3">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm"
                    >
                        إلغاء
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving || !amount} 
                        className="w-40 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg shadow-md text-white bg-slate-600 hover:bg-slate-700 disabled:bg-slate-400 transition-all transform active:scale-95"
                    >
                        {isSaving && <SpinnerIcon className="w-5 h-5" />}
                        {isSaving ? 'جاري الحفظ...' : 'تأكيد الدفع'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

const ClinicalNotesModal: FC<{
  patient: PatientVisit;
  onClose: () => void;
  onSave: (patientId: string, notes: string) => Promise<void>;
}> = ({ patient, onClose, onSave }) => {
  const [notes, setNotes] = useState(patient.clinicalNotes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveClick = async () => {
    setIsSaving(true);
    await onSave(patient.id, notes);
    // The parent component will handle closing the modal upon success
    setIsSaving(false);
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800">الملاحظات السريرية</h2>
            <p className="text-sm text-gray-500">للمراجع: {patient.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </header>
        <div className="p-6 flex-grow flex flex-col">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="form-input flex-grow w-full resize-none"
            placeholder="اكتب التشخيص، العلاج، ملاحظات المتابعة..."
            autoFocus
          />
        </div>
        <footer className="p-4 border-t bg-gray-50 rounded-b-2xl flex-shrink-0 flex justify-end gap-3">
          <button onClick={onClose} className="bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm">إلغاء</button>
          <button onClick={handleSaveClick} disabled={isSaving} className="w-36 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg shadow-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 transition-all">
            {isSaving ? <SpinnerIcon className="w-5 h-5"/> : 'حفظ'}
          </button>
        </footer>
      </div>
    </div>
  );
};


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
  onSetNotes: () => void;
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
  onSetNotes,
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
    'bg-white rounded-xl py-3 px-4 shadow-sm border-l-4 transition-all duration-300 relative group',
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
      
      <div className="mt-2 pt-2 border-t border-gray-200/80 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-gray-600">
        <div className="flex items-center gap-1.5"><UserIcon className="w-4 h-4 text-gray-400" /><span className="font-medium">العمر:</span> {patient.age || 'غير محدد'}</div>
        <div className="flex items-center gap-1.5"><CurrencyDollarIcon className="w-4 h-4 text-gray-400" /><span className="font-medium">المطلوب:</span> <span className="font-bold">{patient.requiredAmount?.toLocaleString() || 'غير محدد'}</span></div>
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
                    <button onMouseDown={(e) => e.stopPropagation()} title="كتابة ملاحظات سريرية" onClick={onSetNotes} className={actionButtonClasses}><ClipboardDocumentListIcon className="w-5 h-5" /></button>
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
  actionButton?: React.ReactNode;
}> = ({ title, children, count, isDragOver, color, actionButton, ...dragProps }) => (
    <div 
      {...dragProps}
      className={`bg-slate-50 border border-slate-200/60 p-4 rounded-xl flex flex-col transition-colors duration-300 h-full ${isDragOver ? 'bg-blue-50 border-blue-300' : ''}`}
    >
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        <div className="flex items-center gap-2">
            {actionButton}
            <span className={`text-sm font-bold px-2.5 py-1 rounded-full text-white ${color}`}>{count}</span>
        </div>
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

const filterableStatuses: (PatientStatus | 'all')[] = [
  'all',
  PatientStatus.Waiting,
  PatientStatus.InProgress,
  PatientStatus.PendingPayment,
  PatientStatus.Done,
  PatientStatus.Cancelled,
  PatientStatus.Skipped,
];

const StatusFilter: FC<{
  activeFilter: PatientStatus | 'all';
  onSelectFilter: (status: PatientStatus | 'all') => void;
  counts: Record<PatientStatus | 'all', number>;
}> = ({ activeFilter, onSelectFilter, counts }) => {
    const statusConfig = {
        'all': { text: 'الكل', color: 'bg-slate-500' },
        [PatientStatus.Waiting]: { text: 'الانتظار', color: 'bg-blue-500' },
        [PatientStatus.InProgress]: { text: 'قيد المعالجة', color: 'bg-red-500' },
        [PatientStatus.PendingPayment]: { text: 'بانتظار الدفع', color: 'bg-yellow-500' },
        [PatientStatus.Done]: { text: 'مكتمل', color: 'bg-green-500' },
        [PatientStatus.Cancelled]: { text: 'ملغي', color: 'bg-gray-600' },
        [PatientStatus.Skipped]: { text: 'تم التجاوز', color: 'bg-gray-500' },
    };

    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2">
            {filterableStatuses.map(status => (
                <button
                    key={status}
                    onClick={() => onSelectFilter(status)}
                    className={`flex items-center gap-2 whitespace-nowrap text-xs font-bold py-1.5 px-3 rounded-full transition-all duration-200 ${
                        activeFilter === status
                            ? `${statusConfig[status].color} text-white shadow`
                            : `bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200`
                    }`}
                >
                    <span>{statusConfig[status].text}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                        activeFilter === status
                            ? 'bg-white/20'
                            : 'bg-slate-200 text-slate-500'
                    }`}>{counts[status]}</span>
                </button>
            ))}
        </div>
    );
};

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
  const [paymentPatient, setPaymentPatient] = useState<PatientVisit | null>(null);
  const [serviceSelectionPatient, setServiceSelectionPatient] = useState<PatientVisit | null>(null);
  const [historyPatient, setHistoryPatient] = useState<PatientVisit | null>(null);
  const [notesPatient, setNotesPatient] = useState<PatientVisit | null>(null);
  const [patientToAction, setPatientToAction] = useState<PatientVisit | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PatientStatus | 'all'>('all');
  const [draggedPatient, setDraggedPatient] = useState<PatientVisit | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<PatientStatus | null>(null);
  const [newlyAddedToPayment, setNewlyAddedToPayment] = useState<Set<string>>(new Set());
  const [visibleArchivedCount, setVisibleArchivedCount] = useState(10);
  const [isArchiving, setIsArchiving] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
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

  const statusCounts = useMemo(() => {
    const counts: Record<PatientStatus | 'all', number> = {
        'all': patients.length,
        [PatientStatus.Waiting]: 0,
        [PatientStatus.InProgress]: 0,
        [PatientStatus.PendingPayment]: 0,
        [PatientStatus.Done]: 0,
        [PatientStatus.Cancelled]: 0,
        [PatientStatus.Skipped]: 0,
    };
    for (const patient of patients) {
        if (counts[patient.status] !== undefined) {
            counts[patient.status]++;
        }
    }
    return counts;
  }, [patients]);

  const filteredPatients = useMemo(() => {
    let results = patients;
    
    // 1. Filter by status
    if (statusFilter !== 'all') {
      results = results.filter(patient => patient.status === statusFilter);
    }

    // 2. Filter by search term
    if (searchTerm) {
      const lowercasedFilter = searchTerm.toLowerCase().replace(/\s/g, '');
      results = results.filter(patient => 
        patient.name.toLowerCase().includes(lowercasedFilter) ||
        patient.phone?.replace(/\s/g, '').includes(lowercasedFilter)
      );
    }
    
    return results;
  }, [patients, searchTerm, statusFilter]);


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
  
  const handlePaymentSave = async (patientId: string, amountPaid: number) => {
    try {
        await updatePatientDetails(patientId, { amountPaid });
        await updatePatientStatus(patientId, PatientStatus.Done);
        setPaymentPatient(null);
        toast.success('تم تسجيل الدفعة بنجاح.');
    } catch (error) {
        toast.error('فشل تسجيل الدفعة.');
        console.error("Payment save failed:", error);
    }
  }

  const handleSaveNotes = async (patientId: string, notes: string) => {
    const toastId = toast.loading('جاري حفظ الملاحظات...');
    try {
      await updatePatientDetails(patientId, { clinicalNotes: notes });
      toast.success('تم حفظ الملاحظات بنجاح.', { id: toastId });
      setNotesPatient(null);
    } catch (error) {
      toast.error('فشل حفظ الملاحظات.', { id: toastId });
      console.error("Failed to save notes:", error);
    }
  };
  
  const handleArchiveCompleted = async () => {
    setShowArchiveConfirm(false);
    const idsToArchive = completedOrCancelled.map(p => p.id);
    if (idsToArchive.length === 0) {
        toast.info('لا توجد سجلات في الأرشيف لأرشفتها.');
        return;
    }

    setIsArchiving(true);
    const toastId = toast.loading('جاري أرشفة السجلات المكتملة...');
    try {
        const count = await archiveVisitsByIds(idsToArchive);
        toast.success(`تمت أرشفة ${count} سجل بنجاح.`, { id: toastId });
    } catch (error) {
        toast.error('فشلت عملية الأرشفة.', { id: toastId });
        console.error(error);
    } finally {
        setIsArchiving(false);
    }
  };

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
        onSetPayment={() => setPaymentPatient(patient)}
        onSetServices={() => setServiceSelectionPatient(patient)}
        onShowHistory={() => setHistoryPatient(patient)}
        onSetNotes={() => setNotesPatient(patient)}
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
        <div className="mb-4 flex-shrink-0 space-y-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="ابحث عن مراجع بالاسم أو الهاتف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input !pr-12"
            />
            {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"><XMarkIcon className="w-5 h-5" /></button>}
          </div>
          <StatusFilter 
            activeFilter={statusFilter}
            onSelectFilter={setStatusFilter}
            counts={statusCounts}
          />
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
          <QueueSection 
            title="الأرشيف" 
            count={completedOrCancelled.length} 
            isDragOver={dragOverColumn === PatientStatus.Cancelled} 
            onDragOver={(e) => handleDragOverColumn(e, PatientStatus.Cancelled)} 
            onDragLeave={handleDragLeaveColumn} 
            onDrop={(e) => handleColumnDrop(e, PatientStatus.Cancelled)} 
            color="bg-gray-500"
            actionButton={
              <button 
                  onClick={() => setShowArchiveConfirm(true)} 
                  disabled={isArchiving || completedOrCancelled.length === 0}
                  className="p-1.5 rounded-full text-xs text-slate-500 hover:bg-slate-200 disabled:opacity-50" 
                  title="أرشفة جميع السجلات في هذا العمود"
              >
                  {isArchiving ? <SpinnerIcon className="w-4 h-4"/> : <ArchiveBoxIcon className="w-4 h-4" />}
              </button>
            }
          >
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
      
      {paymentPatient && role === Role.Secretary && (
        <PaymentModal 
            patient={paymentPatient} 
            onClose={() => setPaymentPatient(null)} 
            onSave={handlePaymentSave} 
        />
      )}
      {serviceSelectionPatient && role === Role.Doctor && (
        <ServiceSelectionModal patient={serviceSelectionPatient} availableServices={availableServices} onClose={() => setServiceSelectionPatient(null)} onSave={(p, services, customItems) => { onSetPatientServices(p, services, customItems); setServiceSelectionPatient(null); }} />
      )}
      {historyPatient && (
        <PatientHistoryModal patientProfileId={historyPatient.patientProfileId} patientName={historyPatient.name} currentVisitId={historyPatient.id} onClose={() => setHistoryPatient(null)} />
      )}
      {notesPatient && role === Role.Doctor && (
        <ClinicalNotesModal
          patient={notesPatient}
          onClose={() => setNotesPatient(null)}
          onSave={handleSaveNotes}
        />
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
      {showArchiveConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
            <header className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold text-gray-800">تأكيد الأرشفة</h2>
              <button onClick={() => setShowArchiveConfirm(false)} className="p-2 rounded-full hover:bg-gray-100">
                <XMarkIcon className="w-6 h-6 text-gray-600" />
              </button>
            </header>
            <div className="p-6 flex-grow">
              <p className="text-gray-600 text-center leading-relaxed">
                سيتم أرشفة <strong>{completedOrCancelled.length}</strong> سجل من قائمة الأرشيف الحالية بشكل دائم.
                <br/>
                لن تظهر هذه السجلات في لوحة التحكم بعد الآن ولكن ستبقى في قاعدة البيانات للأغراض المرجعية. هل أنت متأكد؟
              </p>
            </div>
            <footer className="p-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
              <button onClick={() => setShowArchiveConfirm(false)} className="bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 font-bold py-2.5 px-6 rounded-lg shadow-sm">إلغاء</button>
              <button onClick={handleArchiveCompleted} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2.5 px-6 rounded-lg flex items-center gap-2 shadow-sm">
                <ArchiveBoxIcon className="w-5 h-5" />
                نعم، أرشفة
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};

export default PatientQueueList;