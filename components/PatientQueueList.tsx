
import React, { useState, useMemo, FC, Fragment } from 'react';
import type { Patient, Service } from '../types.ts';
import { PatientStatus, Role } from '../types.ts';
import {
  UserIcon,
  TrashIcon,
  BellIcon,
  CheckIcon,
  ArrowPathIcon,
  PencilIcon,
  CurrencyDollarIcon,
  ArrowUturnLeftIcon,
  Cog8ToothIcon,
} from './Icons.tsx';
import EditablePatientCard from './EditablePatientCard.tsx';
import PaymentInputCard from './PaymentInputCard.tsx';
import ServiceSelectionModal from './ServiceSelectionModal.tsx';
import { toast } from 'react-hot-toast';

interface PatientQueueListProps {
  patients: Patient[];
  role: Role;
  onUpdateStatus: (id: string, status: PatientStatus) => void;
  onDelete: (id: string) => void;
  onCall: (patient: Patient) => void;
  callingPatient: Patient | null;
  availableServices: Service[];
  onSetPatientServices: (patient: Patient, services: Service[]) => void;
}

interface PatientCardProps {
  patient: Patient;
  index?: number;
  role: Role;
  onUpdateStatus: (id: string, status: PatientStatus) => void;
  onDelete: (id: string) => void;
  onCall: (patient: Patient) => void;
  onEdit: () => void;
  onSetPayment: () => void;
  onSetServices: () => void;
  isBeingCalled?: boolean;
}

const PatientCard: FC<PatientCardProps> = ({
  patient,
  index,
  role,
  onUpdateStatus,
  onDelete,
  onCall,
  onEdit,
  onSetPayment,
  onSetServices,
  isBeingCalled,
}) => {
  const statusConfig = {
    [PatientStatus.Waiting]: { text: 'في الانتظار', color: 'bg-blue-100 text-blue-800' },
    [PatientStatus.InProgress]: { text: 'قيد المعالجة', color: 'bg-red-100 text-red-800' },
    [PatientStatus.PendingPayment]: { text: 'بانتظar الدفع', color: 'bg-yellow-100 text-yellow-800' },
    [PatientStatus.Done]: { text: 'مكتمل', color: 'bg-green-100 text-green-800' },
    [PatientStatus.Skipped]: { text: 'تم التجاوز', color: 'bg-gray-100 text-gray-800' },
  };

  const { text: statusText, color: statusColor } = statusConfig[patient.status] || {};

  return (
    <div className={`bg-white rounded-xl p-4 mb-3 shadow-md border-l-4 ${isBeingCalled ? 'border-blue-500 ring-2 ring-blue-500 animate-pulse' : 'border-transparent'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {index !== undefined && <span className="flex-shrink-0 bg-gray-200 text-gray-700 text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center">{index + 1}</span>}
          <div className="flex-grow">
            <h3 className="font-bold text-gray-800 text-lg">{patient.name}</h3>
            {patient.reason && patient.showDetailsToPublic && <p className="text-sm text-gray-500">{patient.reason}</p>}
          </div>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor}`}>{statusText}</span>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <p>العمر: {patient.age || 'غير محدد'}</p>
        <p>المبلغ المطلوب: <span className="font-bold">{patient.requiredAmount?.toLocaleString() || 'غير محدد'}</span></p>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200 flex flex-wrap gap-2 justify-end">
        {/* Actions for Secretary */}
        {role === Role.Secretary && (
          <>
            {patient.status === PatientStatus.Waiting && (
              <>
                <button title="نداء" onClick={() => onCall(patient)} className="action-btn bg-blue-500 hover:bg-blue-600"><BellIcon className="w-4 h-4" /></button>
                <button title="إدخال للفحص" onClick={() => onUpdateStatus(patient.id, PatientStatus.InProgress)} className="action-btn bg-green-500 hover:bg-green-600"><CheckIcon className="w-4 h-4" /></button>
              </>
            )}
            {patient.status === PatientStatus.PendingPayment && (
              <button title="تسجيل دفعة" onClick={onSetPayment} className="action-btn bg-yellow-500 hover:bg-yellow-600"><CurrencyDollarIcon className="w-4 h-4" /></button>
            )}
            {patient.status === PatientStatus.InProgress && (
                <button title="إرجاع للانتظار" onClick={() => onUpdateStatus(patient.id, PatientStatus.Waiting)} className="action-btn bg-gray-500 hover:bg-gray-600"><ArrowUturnLeftIcon className="w-4 h-4"/></button>
            )}
             <button title="تعديل" onClick={onEdit} className="action-btn bg-gray-500 hover:bg-gray-600"><PencilIcon className="w-4 h-4" /></button>
             <button title="حذف" onClick={() => onDelete(patient.id)} className="action-btn bg-red-500 hover:bg-red-600"><TrashIcon className="w-4 h-4" /></button>
          </>
        )}
        {/* Actions for Doctor */}
        {role === Role.Doctor && (
          <>
            {patient.status === PatientStatus.Waiting && (
              <button title="إدخال للفحص" onClick={() => onUpdateStatus(patient.id, PatientStatus.InProgress)} className="action-btn bg-green-500 hover:bg-green-600"><CheckIcon className="w-4 h-4" /></button>
            )}
            {patient.status === PatientStatus.InProgress && (
              <>
                <button title="تحديد الخدمات والرسوم" onClick={onSetServices} className="action-btn bg-blue-500 hover:bg-blue-600"><Cog8ToothIcon className="w-4 h-4" /></button>
                <button title="إنهاء بدون رسوم" onClick={() => onUpdateStatus(patient.id, PatientStatus.Done)} className="action-btn bg-green-500 hover:bg-green-600"><CheckIcon className="w-4 h-4" /></button>
              </>
            )}
             {patient.status !== PatientStatus.InProgress && patient.status !== PatientStatus.Waiting && (
                 <button title="إرجاع للانتظار" onClick={() => onUpdateStatus(patient.id, PatientStatus.Waiting)} className="action-btn bg-gray-500 hover:bg-gray-600"><ArrowUturnLeftIcon className="w-4 h-4"/></button>
             )}
          </>
        )}
      </div>
    </div>
  );
};

const QueueSection: FC<{ title: string; children: React.ReactNode; count: number; }> = ({ title, children, count }) => (
    <div className="bg-gray-50/50 backdrop-blur-sm p-4 rounded-xl shadow-inner border border-gray-200">
      <h2 className="text-lg font-bold text-gray-700 mb-3">{title} ({count})</h2>
      {count > 0 ? (
          <div className="space-y-3">{children}</div>
      ) : (
          <p className="text-center text-gray-500 py-4">لا يوجد مراجعون في هذه القائمة.</p>
      )}
    </div>
);


const PatientQueueList: FC<PatientQueueListProps> = ({
  patients,
  role,
  onUpdateStatus,
  onDelete,
  onCall,
  callingPatient,
  availableServices,
  onSetPatientServices,
}) => {
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
  const [paymentPatientId, setPaymentPatientId] = useState<string | null>(null);
  const [serviceSelectionPatient, setServiceSelectionPatient] = useState<Patient | null>(null);

  const { waiting, inProgress, pendingPayment, doneOrSkipped } = useMemo(() => {
    return patients.reduce((acc, p) => {
      if (p.status === PatientStatus.Waiting) acc.waiting.push(p);
      else if (p.status === PatientStatus.InProgress) acc.inProgress.push(p);
      else if (p.status === PatientStatus.PendingPayment) acc.pendingPayment.push(p);
      else acc.doneOrSkipped.push(p);
      return acc;
    }, { waiting: [], inProgress: [], pendingPayment: [], doneOrSkipped: [] } as Record<string, Patient[]>);
  }, [patients]);
  
  const handlePaymentSave = (patientId: string) => {
    onUpdateStatus(patientId, PatientStatus.Done);
    setPaymentPatientId(null);
    toast.success('تم تسجيل الدفعة بنجاح.');
  }

  const renderPatient = (patient: Patient, index?: number) => {
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
        index={index}
        role={role}
        onUpdateStatus={onUpdateStatus}
        onDelete={onDelete}
        onCall={onCall}
        onEdit={() => setEditingPatientId(patient.id)}
        onSetPayment={() => setPaymentPatientId(patient.id)}
        onSetServices={() => setServiceSelectionPatient(patient)}
        isBeingCalled={callingPatient?.id === patient.id}
      />
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <QueueSection title="الانتظار" count={waiting.length}>
        {waiting.map((p, i) => renderPatient(p, i))}
      </QueueSection>
      <QueueSection title="قيد المعالجة" count={inProgress.length}>
        {inProgress.map(p => renderPatient(p))}
      </QueueSection>
      <QueueSection title="بانتظار الدفع" count={pendingPayment.length}>
        {pendingPayment.map(p => renderPatient(p))}
      </QueueSection>
      <QueueSection title="مكتمل / متجاوز" count={doneOrSkipped.length}>
        {doneOrSkipped.map(p => renderPatient(p))}
      </QueueSection>
      
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
    </div>
  );
};

export default PatientQueueList;
