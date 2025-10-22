import React, { useState } from 'react';
import type { PatientVisit } from '../types.ts';
import { updatePatientDetails } from '../services/firebase.ts';
import { toast } from 'react-hot-toast';
import { SpinnerIcon, UserIcon, CakeIcon, PhoneIcon, PencilIcon as ReasonIcon } from './Icons.tsx';

interface EditablePatientCardProps {
  patient: PatientVisit;
  onCancel: () => void;
  onSave: () => void;
  isBeingCalled?: boolean;
}

const EditablePatientCard: React.FC<EditablePatientCardProps> = ({ patient, onCancel, onSave, isBeingCalled }) => {
  const [name, setName] = useState(patient.name);
  const [phone, setPhone] = useState(patient.phone || '');
  const [reason, setReason] = useState(patient.reason || '');
  const [age, setAge] = useState(patient.age?.toString() || '');
  const [showDetails, setShowDetails] = useState(patient.showDetailsToPublic || false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('اسم المراجع مطلوب.');
      return;
    }

    const ageNum = parseInt(age, 10);
    if (age && (isNaN(ageNum) || ageNum < 0 || ageNum > 120)) {
        toast.error('يرجى إدخال عمر صحيح (بين 0 و 120).');
        return;
    }
    const phoneRegex = /^[0-9\s+()-]*$/;
    if (phone && !phoneRegex.test(phone)) {
        toast.error('رقم الهاتف يحتوي على رموز غير صالحة.');
        return;
    }
    
    setIsSaving(true);
    try {
      await updatePatientDetails(patient.id, { 
          patientProfileId: patient.patientProfileId,
          name, 
          phone, 
          reason,
          age: age ? ageNum : null,
          showDetailsToPublic: showDetails
      });
      toast.success('تم حفظ التعديلات.');
      onSave();
    } catch (error) {
      console.error("Failed to update patient details:", error);
      toast.error('فشل حفظ التعديلات.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const iconClasses = "pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400";
  const inputClasses = "form-input !pr-10";
  const fieldWrapperClasses = "p-3 bg-slate-50/70 rounded-lg border border-slate-200/80";

  return (
    <div className={`bg-white border-2 border-[var(--theme-color)] rounded-xl p-4 shadow-lg animate-fade-in ${isBeingCalled ? 'ring-4 ring-offset-2 ring-[var(--theme-color)] animate-pulse' : ''}`}>
      <form onSubmit={handleSave}>
        <div className="space-y-3">
          
          <div className={fieldWrapperClasses}>
            <label htmlFor={`name-${patient.id}`} className="block text-sm font-medium text-slate-700 mb-1.5">الاسم</label>
            <div className="relative">
                <div className={iconClasses}><UserIcon className="w-5 h-5"/></div>
                <input id={`name-${patient.id}`} type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} required autoFocus />
            </div>
          </div>
          
          <div className={fieldWrapperClasses}>
            <label htmlFor={`age-${patient.id}`} className="block text-sm font-medium text-slate-700 mb-1.5">العمر</label>
            <div className="relative">
                <div className={iconClasses}><CakeIcon className="w-5 h-5"/></div>
                <input id={`age-${patient.id}`} type="text" inputMode="numeric" value={age} onChange={(e) => { if (/^\d*$/.test(e.target.value)) setAge(e.target.value); }} className={inputClasses} />
            </div>
          </div>

          <div className={fieldWrapperClasses}>
            <label htmlFor={`phone-${patient.id}`} className="block text-sm font-medium text-slate-700 mb-1.5">الهاتف</label>
            <div className="relative">
                <div className={iconClasses}><PhoneIcon className="w-5 h-5"/></div>
                <input id={`phone-${patient.id}`} type="tel" value={phone} onChange={(e) => { if (/^[0-9\s+()-]*$/.test(e.target.value)) setPhone(e.target.value); }} className={inputClasses} />
            </div>
          </div>
          
          <div className={fieldWrapperClasses}>
            <label htmlFor={`reason-${patient.id}`} className="block text-sm font-medium text-slate-700 mb-1.5">سبب الزيارة</label>
            <div className="relative">
                <div className={iconClasses}><ReasonIcon className="w-5 h-5"/></div>
                <input id={`reason-${patient.id}`} type="text" value={reason} onChange={(e) => setReason(e.target.value)} className={inputClasses} />
            </div>
          </div>

          <label htmlFor={`showDetails-${patient.id}`} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/60 transition-colors">
            <span className="font-medium text-slate-700 text-sm">إظهار سبب الزيارة على الشاشة العامة</span>
            <div className="relative inline-flex items-center cursor-pointer">
                <input
                    id={`showDetails-${patient.id}`}
                    type="checkbox"
                    checked={showDetails}
                    onChange={(e) => setShowDetails(e.target.checked)}
                    className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-offset-1 peer-focus:ring-[var(--theme-color)] peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] rtl:after:right-[1px] rtl:after:left-auto after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--theme-color)]"></div>
            </div>
          </label>
        </div>
        
        <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-slate-200">
          <button type="button" onClick={onCancel} className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm">
            إلغاء
          </button>
          <button type="submit" disabled={isSaving} className="w-40 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg shadow-md text-white bg-[var(--theme-color)] hover:opacity-90 disabled:bg-slate-400 transition-all transform active:scale-95">
            {isSaving && <SpinnerIcon className="w-5 h-5" />}
            {isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditablePatientCard;