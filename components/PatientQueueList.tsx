import React, { useState, Fragment } from 'react';
import type { Patient, Service } from '../types.ts';
import { Role, PatientStatus } from '../types.ts';
import { BellIcon, CheckIcon, ArrowPathIcon, TrashIcon, PencilIcon, CurrencyDollarIcon } from './Icons.tsx';
import EditablePatientCard from './EditablePatientCard.tsx';
import ServiceSelectionModal from './ServiceSelectionModal.tsx';
import { updatePatientDetails } from '../services/firebase.ts';
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

const PatientQueueList: React.FC<PatientQueueListProps> = ({
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
  const [serviceSelectionPatient, setServiceSelectionPatient] = useState<Patient | null>(null);

  const isActionable = role === Role.Doctor || role === Role.Secretary;
  
  const handleConfirmPayment = async (patient: Patient) => {
    try {
      await updatePatientDetails(patient.id, {
        status: PatientStatus.Done,
        amountPaid: patient.requiredAmount,
      });
      toast.success(`تم تأكيد دفعة ${patient.name}`);
    } catch (error) {
      toast.error('فشل تأكيد الدفعة.');
      console.error('Failed to confirm payment:', error);
    }
  };


  const renderPatientCard = (patient: Patient) => {
    const isEditing = editingPatientId === patient.id;
    const isBeingCalled = callingPatient?.id === patient.id;

    if (isEditing) {
      return (
        <EditablePatientCard
          key={patient.id}
          patient={patient}
          onCancel={() => setEditingPatientId(null)}
          onSave={() => setEditingPatientId(null)}
          isBeingCalled={isBeingCalled}
        />
      );
    }

    const statusStyles = {
        [PatientStatus.Waiting]: { border: 'border-blue-500', bg: 'bg-white' },
        [PatientStatus.InProgress]: { border: 'border-red-500', bg: 'bg-red-50' },
        [PatientStatus.PendingPayment]: { border: 'border-yellow-500', bg: 'bg-yellow-50' },
        [PatientStatus.Done]: { border: 'border-green-500', bg: 'bg-green-50' },
        [PatientStatus.Skipped]: { border: 'border-gray-500', bg: 'bg-gray-50' },
    };

    const currentStyle = statusStyles[patient.status] || statusStyles[PatientStatus.Waiting];

    return (
      <div key={patient.id} className={`${currentStyle.bg} rounded-xl p-4 mb-3 shadow-md border-l-4 transition-all duration-300 ${isBeingCalled ? 'ring-4 ring-offset-2 ring-blue-500 animate-pulse' : ''} ${currentStyle.border}`}>
        <div className="flex justify-between items-start">
          <div>
            <p className="font-bold text-2xl text-gray-800">{patient.name}</p>
            {patient.reason && <p className="text-md text-gray-600 mt-1">{patient.reason}</p>}
          </div>
          {isActionable && (
            <div className="flex items-center gap-1">
              <button onClick={() => setEditingPatientId(patient.id)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full" title="تعديل"><PencilIcon className="w-5 h-5"/></button>
              <button onClick={() => onDelete(patient.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full" title="حذف"><TrashIcon className="w-5 h-5"/></button>
            </div>
          )}
        </div>
        
        {isActionable && (
          <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-gray-200">
            {patient.status === PatientStatus.Waiting && (
                <div className="flex gap-2">
                    <button onClick={() => onCall(patient)} className="action-btn bg-blue-500 hover:bg-blue-600"><BellIcon className="w-4 h-4 mr-1"/> نداء</button>
                    {role === Role.Doctor && <button onClick={() => onUpdateStatus(patient.id, PatientStatus.InProgress)} className="action-btn bg-green-500 hover:bg-green-600"><CheckIcon className="w-4 h-4 mr-1"/> بدء الكشف</button>}
                </div>
            )}
            {patient.status === PatientStatus.InProgress && role === Role.Doctor && (
                <button onClick={() => setServiceSelectionPatient(patient)} className="action-btn bg-yellow-500 hover:bg-yellow-600 w-full"><CurrencyDollarIcon className="w-4 h-4 mr-1"/> إنهاء وتحديد الرسوم</button>
            )}
            {patient.status === PatientStatus.PendingPayment && role === Role.Secretary && (
                <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 mb-2">المبلغ المطلوب: <span className="font-bold text-lg text-green-600">{patient.requiredAmount?.toLocaleString()} د.ع</span></p>
                    <button onClick={() => handleConfirmPayment(patient)} className="action-btn bg-green-500 hover:bg-green-600 w-full"><CheckIcon className="w-4 h-4 mr-1"/> تأكيد استلام المبلغ</button>
                </div>
            )}
            {(patient.status === PatientStatus.Waiting || patient.status === PatientStatus.InProgress) && (
                 <button onClick={() => onUpdateStatus(patient.id, PatientStatus.Skipped)} className="action-btn bg-gray-500 hover:bg-gray-600"> تخطي</button>
            )}
            {patient.status === PatientStatus.Done && (
                <p className="text-green-600 font-semibold text-sm flex items-center justify-center"><CheckIcon className="w-5 h-5 mr-1"/> مكتمل</p>
            )}
            {patient.status === PatientStatus.Skipped && (
                <p className="text-gray-600 font-semibold text-sm flex items-center justify-center"><ArrowPathIcon className="w-5 h-5 mr-1"/> تم تخطيه</p>
            )}
          </div>
        )}
      </div>
    );
  };
  
  const sections = [
    { title: 'قيد المعالجة', status: PatientStatus.InProgress, hiddenForPublic: false },
    { title: 'في الانتظار', status: PatientStatus.Waiting, hiddenForPublic: false },
    { title: 'بانتظار الدفع', status: PatientStatus.PendingPayment, hiddenForPublic: true },
    { title: 'المراجعون المكتملون', status: PatientStatus.Done, hiddenForPublic: true },
    { title: 'تم تخطيهم', status: PatientStatus.Skipped, hiddenForPublic: true },
  ];

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sections.map(section => {
          if (section.hiddenForPublic && role === Role.Public) return null;

          const filteredPatients = patients.filter(p => p.status === section.status);
          if (filteredPatients.length === 0 && role === Role.Public) return null;

          return (
            <div key={section.status} className="bg-gray-100/50 p-4 rounded-xl">
              <h3 className="font-bold text-gray-700 mb-4 text-center">{section.title} ({filteredPatients.length})</h3>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {filteredPatients.length > 0
                  ? filteredPatients.map(renderPatientCard)
                  : isActionable && <p className="text-center text-gray-500 pt-4">لا يوجد مراجعون في هذه القائمة.</p>}
              </div>
            </div>
          );
        })}
      </div>
      {serviceSelectionPatient && (
        <ServiceSelectionModal 
            patient={serviceSelectionPatient}
            availableServices={availableServices}
            onClose={() => setServiceSelectionPatient(null)}
            onSave={(patient, services) => {
                onSetPatientServices(patient, services);
                setServiceSelectionPatient(null);
            }}
        />
      )}
      <style>{`
        .action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          padding: 8px 12px;
          border-radius: 8px;
          transition: background-color 0.2s;
          font-size: 14px;
          flex-grow: 1;
        }
      `}</style>
    </>
  );
};

export default PatientQueueList;