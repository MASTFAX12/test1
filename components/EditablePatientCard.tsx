import React, { useState } from 'react';
import type { Patient } from '../types.ts';
import { updatePatientDetails } from '../services/firebase.ts';
import { toast } from 'react-hot-toast';

interface EditablePatientCardProps {
  patient: Patient;
  onCancel: () => void;
  onSave: () => void;
  isBeingCalled?: boolean;
}

const EditablePatientCard: React.FC<EditablePatientCardProps> = ({ patient, onCancel, onSave, isBeingCalled }) => {
  const [name, setName] = useState(patient.name);
  const [phone, setPhone] = useState(patient.phone || '');
  const [reason, setReason] = useState(patient.reason || '');
  const [age, setAge] = useState(patient.age?.toString() || '');
  const [amountPaid, setAmountPaid] = useState(patient.amountPaid?.toString() || '');
  const [showDetails, setShowDetails] = useState(patient.showDetailsToPublic || false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('اسم المراجع مطلوب.');
      return;
    }

    // Improved validation for numeric fields
    const ageNum = parseInt(age, 10);
    if (age && (isNaN(ageNum) || ageNum < 0)) {
        toast.error('يرجى إدخال عمر صحيح (رقم موجب).');
        return;
    }
    const amountNum = parseFloat(amountPaid);
    if (amountPaid && (isNaN(amountNum) || amountNum < 0)) {
        toast.error('يرجى إدخال مبلغ صحيح (رقم موجب).');
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
          name, 
          phone, 
          reason,
          age: age ? ageNum : null,
          amountPaid: amountPaid ? amountNum : null,
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

  return (
    <div className={`bg-blue-50 border-2 border-blue-400 rounded-xl p-4 mb-3 shadow-lg animate-fade-in ${isBeingCalled ? 'ring-4 ring-offset-2 ring-blue-500 animate-pulse' : ''}`}>
      <form onSubmit={handleSave} className="space-y-3">
        <div className="space-y-2">
            <label className="text-xs font-bold text-gray-600">الاسم</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm" required autoFocus />
        </div>
         <div className="grid grid-cols-2 gap-3">
            <div>
                 <label className="text-xs font-bold text-gray-600">العمر</label>
                 <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm" />
            </div>
            <div>
                 <label className="text-xs font-bold text-gray-600">المبلغ</label>
                 <input type="number" step="any" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm" />
            </div>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-600">الهاتف</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-600">السبب</label>
          <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm" />
        </div>
         <div>
          <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer text-sm">
            <input type="checkbox" checked={showDetails} onChange={(e) => setShowDetails(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-gray-700">إظهار للعامة</span>
          </label>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-3 rounded-md transition duration-200 text-xs">
            إلغاء
          </button>
          <button type="submit" disabled={isSaving} className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded-md transition duration-200 text-xs disabled:bg-gray-400">
            {isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditablePatientCard;