import React, { useState, useMemo, FC, DragEvent, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import type { PatientVisit, ClinicSettings } from '../types.ts';
import { PatientStatus, Role } from '../types.ts';
import {
  BellIcon,
  CheckIcon,
  PencilIcon,
  CurrencyDollarIcon,
  ArrowUturnLeftIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArchiveBoxIcon,
  XMarkIcon,
  UserIcon,
  SpinnerIcon,
  ClipboardDocumentListIcon,
  ConfirmationDialog,
  PaperAirplaneIcon,
  WrenchScrewdriverIcon as ExaminationIcon,
  ArrowPathIcon,
} from './Icons.tsx';
import EditablePatientCard from './EditablePatientCard.tsx';
import { toast } from 'react-hot-toast';
import PatientHistoryModal from './PatientHistoryModal.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';
import ExaminationNotesModal from './ExaminationNotesModal.tsx';
import { updatePatientDetails, updatePatientStatus, updateClinicSettings } from '../services/firebase.ts';

interface PaymentModalProps {
  patient: PatientVisit;
  onClose: () => void;
  onSave: (patientId: string, amount: number, notes: string) => Promise<void>;
  settings: ClinicSettings;
}

const PaymentModal: FC<PaymentModalProps> = ({ patient, onClose, onSave, settings }) => {
    const [amount, setAmount] = useState(patient.paymentAmount?.toString() || '');
    const [notes, setNotes] = useState(patient.paymentNotes || '');
    const [isSaving, setIsSaving] = useState(false);
    
    const [isEditingShortcut, setIsEditingShortcut] = useState(false);
    const [newShortcutAmount, setNewShortcutAmount] = useState(settings.quickPaymentAmount.toString());

    const handleSave = async () => {
        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum < 0) {
            toast.error('الرجاء إدخال مبلغ صحيح.');
            return;
        }
        setIsSaving(true);
        await onSave(patient.id, amountNum, notes);
        setIsSaving(false);
    };

    const handleShortcutEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditingShortcut(true);
    };

    const handleShortcutSave = async () => {
        const newAmount = parseInt(newShortcutAmount, 10);
        if (!isNaN(newAmount) && newAmount > 0) {
            const toastId = toast.loading('جاري تحديث الاختصار...');
            try {
                await updateClinicSettings({ quickPaymentAmount: newAmount });
                toast.success('تم تحديث مبلغ الاختصار.', { id: toastId });
            } catch (error) {
                toast.error('فشل تحديث الاختصار.', { id: toastId });
            }
        }
        setIsEditingShortcut(false);
    };
    
    const shortcutValueFormatted = new Intl.NumberFormat('ar-IQ').format(settings.quickPaymentAmount);

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
                    <div className="space-y-3">
                        <label htmlFor="paymentAmount" className="block text-sm font-medium text-slate-700 mb-1 text-center">أدخل المبلغ المدفوع</label>
                        
                        <div className="flex justify-center mb-3">
                           {isEditingShortcut ? (
                                <div className="relative">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={newShortcutAmount}
                                        onChange={(e) => { if (/^\d*$/.test(e.target.value)) setNewShortcutAmount(e.target.value); }}
                                        onBlur={handleShortcutSave}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleShortcutSave(); } }}
                                        className="form-input text-lg text-center font-bold w-36"
                                        autoFocus
                                    />
                                </div>
                            ) : (
                                <button 
                                    type="button"
                                    onClick={() => setAmount(settings.quickPaymentAmount.toString())}
                                    className="relative bg-white border-2 border-slate-300 hover:border-[var(--theme-color)] text-slate-700 font-bold py-2 px-6 rounded-lg transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--theme-color)]"
                                >
                                    {shortcutValueFormatted} <span className="text-xs font-normal">د.ع</span>
                                    <div 
                                        onClick={handleShortcutEdit}
                                        title="تعديل مبلغ الاختصار"
                                        className="absolute top-0 right-0 -mt-1 -mr-1 w-5 h-5 flex items-center justify-center rounded-full bg-slate-200 group-hover:bg-[var(--theme-color)] transition-all duration-200 cursor-pointer"
                                    >
                                        <PencilIcon className="w-3 h-3 text-slate-500 group-hover:text-white" />
                                    </div>
                                </button>
                            )}
                        </div>

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
                                autoFocus={!isEditingShortcut}
                            />
                        </div>
                    </div>
                     <div className="space-y-3">
                        <label htmlFor="paymentNotes" className="block text-sm font-medium text-slate-700 mb-1 text-center">ملاحظات (اختياري)</label>
                         <textarea
                            id="paymentNotes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="form-input w-full resize-y"
                            placeholder="اكتب ملاحظات حول الدفعة..."
                            rows={2}
                        />
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
          <button onClick={handleSaveClick} disabled={isSaving} className="w-36 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg shadow-md text-white bg-[var(--theme-color)] hover:opacity-90 disabled:bg-gray-400 transition-all">
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
  settings: ClinicSettings;
  onUpdateStatus: (id: string, status: PatientStatus) => void;
  onCancel: (id: string) => void;
  onDeletePatient: (id: string) => void;
  onCall: (patient: PatientVisit) => void;
  onStopCall: () => void;
  onReorder: (patientId: string, newTimestamp: Timestamp) => void;
  callingPatient: PatientVisit | null;
}

interface PatientCardProps {
  patient: PatientVisit;
  index?: number;
  role: Role;
  settings: ClinicSettings;
  onUpdateStatus: (id: string, status: PatientStatus) => void;
  onMoveToInProgress: (patient: PatientVisit) => void;
  onCancel: (id: string) => void;
  onDeleteClick: (patient: PatientVisit) => void;
  onCall: (patient: PatientVisit) => void;
  onStopCall: () => void;
  onEdit: () => void;
  onSetPayment: () => void;
  onShowHistory: () => void;
  onSetNotes: () => void;
  onSetExaminationNotes: () => void;
  isBeingCalled?: boolean;
  isDraggable?: boolean;
  onDragStart?: (e: DragEvent<HTMLDivElement>, patient: PatientVisit) => void;
  onDragEnd?: (e: DragEvent<HTMLDivElement>) => void;
  onDragOverReorder?: (e: DragEvent<HTMLDivElement>) => void;
  onDropReorder?: (e: DragEvent<HTMLDivElement>, patientId: string) => void;
  onDragLeaveReorder?: (e: DragEvent<HTMLDivElement>) => void;
}

const PatientCard: FC<PatientCardProps> = ({
  patient,
  index,
  role,
  onUpdateStatus,
  onMoveToInProgress,
  onDeleteClick,
  onCall,
  onStopCall,
  onEdit,
  onSetPayment,
  onShowHistory,
  onSetNotes,
  onSetExaminationNotes,
  isBeingCalled,
  isDraggable,
  onDragStart,
  onDragEnd,
  onDragOverReorder,
  onDropReorder,
  onDragLeaveReorder,
}) => {
  const statusConfig = {
    [PatientStatus.Waiting]: { text: 'في الانتظار', color: 'bg-blue-100 text-blue-800', borderColor: 'border-blue-400' },
    [PatientStatus.InProgress]: { text: 'قيد المعالجة', color: 'bg-red-100 text-red-800', borderColor: 'border-red-400' },
    [PatientStatus.PendingExamination]: { text: 'بانتظار الفحص', color: 'bg-purple-100 text-purple-800', borderColor: 'border-purple-400' },
    [PatientStatus.Done]: { text: 'مكتمل', color: 'bg-green-100 text-green-800', borderColor: 'border-green-400' },
    [PatientStatus.Skipped]: { text: 'تم التجاوز', color: 'bg-gray-100 text-gray-800', borderColor: 'border-gray-300' },
    [PatientStatus.Cancelled]: { text: 'ملغي', color: 'bg-gray-100 text-gray-800', borderColor: 'border-gray-300' },
  };

  const { text: statusText, color: statusColor, borderColor } = statusConfig[patient.status] || {};
  const isArchived = [PatientStatus.Done, PatientStatus.Cancelled, PatientStatus.Skipped].includes(patient.status);

  const cardClasses = [
    'bg-white rounded-xl py-3 px-4 shadow-sm border-l-4 transition-all duration-300 relative group',
    isBeingCalled ? 'ring-2 ring-[var(--theme-color)] animate-pulse' : 'hover:shadow-lg hover:-translate-y-1',
    isDraggable ? 'cursor-grab' : '',
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
            {patient.isPaid && patient.status === PatientStatus.Waiting && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-200 text-green-800 animate-fade-in" title={`تم دفع ${patient.paymentAmount?.toLocaleString()} د.ع`}>
                    تم الدفع
                </span>
            )}
        </div>
      </div>
      
      <div className="mt-2 pt-2 border-t border-gray-200/80 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-gray-600">
        <div className="flex items-center gap-1.5"><UserIcon className="w-4 h-4 text-gray-400" /><span className="font-medium">العمر:</span> {patient.age || 'غير محدد'}</div>
        <div className="flex items-center gap-1.5"><CurrencyDollarIcon className="w-4 h-4 text-gray-400" /><span className="font-medium">المدفوع:</span> <span className="font-bold">{patient.paymentAmount?.toLocaleString() || 'لم يدفع'}</span></div>
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
                {patient.status === PatientStatus.Waiting && (
                  <>
                    <button onMouseDown={(e) => e.stopPropagation()} title="نداء" onClick={() => onCall(patient)} disabled={!!isBeingCalled} className={actionButtonClasses}><BellIcon className="w-5 h-5" /></button>
                    <button onMouseDown={(e) => e.stopPropagation()} title="إدخال للطبيب" onClick={() => onMoveToInProgress(patient)} className={actionButtonClasses}><CheckIcon className="w-5 h-5" /></button>
                    <button onMouseDown={(e) => e.stopPropagation()} title="تسجيل دفعة" onClick={onSetPayment} className={actionButtonClasses}><CurrencyDollarIcon className="w-5 h-5" /></button>
                  </>
                )}
                {patient.status === PatientStatus.InProgress && (
                    <button onMouseDown={(e) => e.stopPropagation()} title="إرسال للفحص" onClick={() => onUpdateStatus(patient.id, PatientStatus.PendingExamination)} className={actionButtonClasses}><ExaminationIcon className="w-5 h-5" /></button>
                )}
                {patient.status === PatientStatus.PendingExamination && (
                    <button onMouseDown={(e) => e.stopPropagation()} title="إعادة للطبيب (إلى قيد المعالجة)" onClick={() => onMoveToInProgress(patient)} className={actionButtonClasses}><ArrowPathIcon className="w-5 h-5"/></button>
                )}
                 {!isArchived && (
                   <>
                      <button onMouseDown={(e) => e.stopPropagation()} title="تعديل" onClick={onEdit} disabled={isBeingCalled} className={actionButtonClasses}><PencilIcon className="w-5 h-5" /></button>
                      <button onMouseDown={(e) => e.stopPropagation()} title="أرشفة أو حذف" onClick={() => onDeleteClick(patient)} className={actionButtonClasses}><TrashIcon className="w-5 h-5" /></button>
                   </>
                 )}
                 {isArchived && (
                    <button onMouseDown={(e) => e.stopPropagation()} title="إرجاع للانتظار" onClick={() => onUpdateStatus(patient.id, PatientStatus.Waiting)} className={actionButtonClasses}><ArrowUturnLeftIcon className="w-5 h-5"/></button>
                 )}
              </>
            )}

            {/* DOCTOR ACTIONS */}
            {role === Role.Doctor && (
              <>
                {patient.status === PatientStatus.Waiting && (
                  <button onMouseDown={(e) => e.stopPropagation()} title="إدخال للفحص" onClick={() => onMoveToInProgress(patient)} className={actionButtonClasses}><CheckIcon className="w-5 h-5" /></button>
                )}
                {patient.status === PatientStatus.InProgress && (
                  <>
                    <button onMouseDown={(e) => e.stopPropagation()} title="كتابة ملاحظات سريرية" onClick={onSetNotes} className={actionButtonClasses}><ClipboardDocumentListIcon className="w-5 h-5" /></button>
                    <button onMouseDown={(e) => e.stopPropagation()} title="إرسال للفحص مع ملاحظات" onClick={onSetExaminationNotes} className={actionButtonClasses}><PaperAirplaneIcon className="w-5 h-5" /></button>
                    <button onMouseDown={(e) => e.stopPropagation()} title="مكتمل" onClick={() => onUpdateStatus(patient.id, PatientStatus.Done)} className={actionButtonClasses}><CheckIcon className="w-5 h-5" /></button>
                  </>
                )}
                {patient.status === PatientStatus.PendingExamination && (
                    <>
                        <button onMouseDown={(e) => e.stopPropagation()} title="إعادة للفحص (إلى قيد المعالجة)" onClick={() => onMoveToInProgress(patient)} className={actionButtonClasses}><ArrowPathIcon className="w-5 h-5"/></button>
                        <button onMouseDown={(e) => e.stopPropagation()} title="مكتمل" onClick={() => onUpdateStatus(patient.id, PatientStatus.Done)} className={actionButtonClasses}><CheckIcon className="w-5 h-5" /></button>
                    </>
                )}
                 {patient.status !== PatientStatus.Waiting && !isArchived && (
                     <button onMouseDown={(e) => e.stopPropagation()} title="إرجاع للانتظار" onClick={() => onUpdateStatus(patient.id, PatientStatus.Waiting)} className={actionButtonClasses}><ArrowUturnLeftIcon className="w-5 h-5"/></button>
                 )}
                 {isArchived && (
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

const filterableStatuses: (PatientStatus | 'all')[] = [
  'all',
  PatientStatus.Waiting,
  PatientStatus.InProgress,
  PatientStatus.PendingExamination,
  PatientStatus.Done,
  PatientStatus.Cancelled,
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
        [PatientStatus.PendingExamination]: { text: 'بانتظار الفحص', color: 'bg-purple-500' },
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
  settings,
  onUpdateStatus,
  onCancel,
  onDeletePatient,
  onCall,
  onStopCall,
  onReorder,
  callingPatient,
}) => {
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
  const [paymentPatient, setPaymentPatient] = useState<PatientVisit | null>(null);
  const [historyPatient, setHistoryPatient] = useState<PatientVisit | null>(null);
  const [notesPatient, setNotesPatient] = useState<PatientVisit | null>(null);
  const [examinationNotesPatient, setExaminationNotesPatient] = useState<PatientVisit | null>(null);
  const [patientToAction, setPatientToAction] = useState<PatientVisit | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PatientStatus | 'all'>('all');
  const [draggedPatient, setDraggedPatient] = useState<PatientVisit | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<PatientStatus | null>(null);
  const [visibleArchivedCount, setVisibleArchivedCount] = useState(10);

  const statusCounts = useMemo(() => {
    const counts: Record<PatientStatus | 'all', number> = {
        'all': patients.length,
        [PatientStatus.Waiting]: 0,
        [PatientStatus.InProgress]: 0,
        [PatientStatus.PendingExamination]: 0,
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
    
    if (statusFilter !== 'all') {
      results = results.filter(patient => patient.status === statusFilter);
    }

    if (searchTerm) {
      const lowercasedFilter = searchTerm.toLowerCase().replace(/\s/g, '');
      results = results.filter(patient => 
        patient.name.toLowerCase().includes(lowercasedFilter) ||
        patient.phone?.replace(/\s/g, '').includes(lowercasedFilter)
      );
    }
    
    return results;
  }, [patients, searchTerm, statusFilter]);


  const { waiting, inProgress, pendingExamination, completedOrCancelled } = useMemo(() => {
    const lists = filteredPatients.reduce((acc, p) => {
      if (p.status === PatientStatus.Waiting) acc.waiting.push(p);
      else if (p.status === PatientStatus.InProgress) acc.inProgress.push(p);
      else if (p.status === PatientStatus.PendingExamination) acc.pendingExamination.push(p);
      else acc.completedOrCancelled.push(p);
      return acc;
    }, { waiting: [], inProgress: [], pendingExamination: [], completedOrCancelled: [] } as Record<string, PatientVisit[]>);
    
    lists.completedOrCancelled.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
    return lists;
  }, [filteredPatients]);
  
  const handlePaymentSave = async (patientId: string, paymentAmount: number, paymentNotes: string) => {
    try {
        const detailsToUpdate: Partial<Omit<PatientVisit, 'id'>> = { 
            paymentAmount, 
            paymentNotes, 
            isPaid: true 
        };
        await updatePatientDetails(patientId, detailsToUpdate);
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

  const handleSaveExaminationNotes = async (patientId: string, notes: string) => {
    const toastId = toast.loading('جاري إرسال المراجع للفحص...');
    try {
        const patient = patients.find(p => p.id === patientId);
        if (!patient) throw new Error("Patient not found");

        const existingNotes = patient.clinicalNotes || '';
        const timestamp = new Date().toLocaleString('ar-SA', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
        const newNotesSection = `\n\n--- ملاحظات للفحص [${timestamp}] ---\n${notes}`;
        
        const updatedNotes = existingNotes + newNotesSection;

        await updatePatientDetails(patientId, { 
            clinicalNotes: updatedNotes,
            status: PatientStatus.PendingExamination 
        });

        toast.success('تم إرسال المراجع للفحص بنجاح.', { id: toastId });
        setExaminationNotesPatient(null);
    } catch (error) {
        toast.error('فشل إرسال المراجع للفحص.', { id: toastId });
        console.error("Failed to send patient for examination:", error);
    }
  };

  const handleMoveToInProgress = (patient: PatientVisit) => {
    if (settings.requirePaymentBeforeInProgress && !patient.isPaid) {
      toast.error('يجب تسجيل دفعة للمراجع أولاً قبل إدخاله للطبيب.');
      return;
    }
    if (inProgress.length > 0 && !inProgress.some(p => p.id === patient.id)) {
      toast.error('يوجد مراجع قيد الفحص حالياً. لا يمكن إدخال مراجع آخر.');
      return;
    }
    onUpdateStatus(patient.id, PatientStatus.InProgress);
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

    if ([PatientStatus.Done, PatientStatus.Cancelled, PatientStatus.Skipped].includes(draggedPatient.status)) {
        toast.error('لا يمكن إعادة مراجع من الأرشيف.');
        return;
    }
    if (targetStatus === PatientStatus.InProgress) {
        handleMoveToInProgress(draggedPatient);
    } else {
        onUpdateStatus(draggedPatient.id, targetStatus);
    }
  };

  const handleReorderDrop = (e: DragEvent<HTMLDivElement>, targetPatientId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.borderTop = "";
    if (!draggedPatient || draggedPatient.id === targetPatientId || draggedPatient.status !== PatientStatus.Waiting) return;
    
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

  const renderPatient = (patient: PatientVisit, options: {index?: number} = {}) => {
    if (editingPatientId === patient.id && role === Role.Secretary) {
      return <EditablePatientCard key={patient.id} patient={patient} onCancel={() => setEditingPatientId(null)} onSave={() => setEditingPatientId(null)} isBeingCalled={callingPatient?.id === patient.id} />;
    }
    return (
      <PatientCard
        key={patient.id}
        patient={patient}
        index={options.index}
        role={role}
        settings={settings}
        onUpdateStatus={onUpdateStatus}
        onMoveToInProgress={handleMoveToInProgress}
        onCancel={onCancel}
        onDeleteClick={setPatientToAction}
        onCall={onCall}
        onStopCall={onStopCall}
        onEdit={() => setEditingPatientId(patient.id)}
        onSetPayment={() => setPaymentPatient(patient)}
        onShowHistory={() => setHistoryPatient(patient)}
        onSetNotes={() => setNotesPatient(patient)}
        onSetExaminationNotes={() => setExaminationNotesPatient(patient)}
        isBeingCalled={callingPatient?.id === patient.id}
        isDraggable={[Role.Doctor, Role.Secretary].includes(role) && ![PatientStatus.Done, PatientStatus.Cancelled, PatientStatus.Skipped].includes(patient.status)}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDropReorder={handleReorderDrop}
        onDragOverReorder={handleDragOverReorder}
        onDragLeaveReorder={handleDragLeaveReorder}
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
          <QueueSection title="بانتظار الفحص" count={pendingExamination.length} isDragOver={dragOverColumn === PatientStatus.PendingExamination} onDragOver={(e) => handleDragOverColumn(e, PatientStatus.PendingExamination)} onDragLeave={handleDragLeaveColumn} onDrop={(e) => handleColumnDrop(e, PatientStatus.PendingExamination)} color="bg-purple-500">
            {pendingExamination.map((p) => renderPatient(p))}
          </QueueSection>
          <QueueSection 
            title="الأرشيف" 
            count={completedOrCancelled.length} 
            isDragOver={dragOverColumn === PatientStatus.Cancelled} 
            onDragOver={(e) => handleDragOverColumn(e, PatientStatus.Cancelled)} 
            onDragLeave={handleDragLeaveColumn} 
            onDrop={(e) => handleColumnDrop(e, PatientStatus.Cancelled)} 
            color="bg-gray-500"
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
            settings={settings}
        />
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
      {examinationNotesPatient && role === Role.Doctor && (
        <ExaminationNotesModal
            patient={examinationNotesPatient}
            onClose={() => setExaminationNotesPatient(null)}
            onSave={handleSaveExaminationNotes}
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
    </>
  );
};

export default PatientQueueList;