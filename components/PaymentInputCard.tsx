import React, { useState } from 'react';
import type { PatientVisit } from '../types.ts';
import { updatePatientDetails } from '../services/firebase.ts';
import { CurrencyDollarIcon } from './Icons.tsx';

interface PaymentInputCardProps {
  patient: PatientVisit;
  onCancel: () => void;
  onSave: (patientId: string) => void;
}

const PaymentInputCard: React.FC<PaymentInputCardProps> = ({ patient, onCancel, onSave }) => {
  const [amount, setAmount] = useState(patient.amountPaid?.toString() || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      setError('الرجاء إدخال مبلغ صحيح.');
      return;
    }
    setError('');
    setIsSaving(true);
    try {
      await updatePatientDetails(patient.id, { 
          amountPaid: parsedAmount
      });
      onSave(patient.id);
    } catch (error) {
      console.error("Failed to update patient payment:", error);
      setError('فشل في تحديث المبلغ.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 mb-3 shadow-lg animate-fade-in">
      <form onSubmit={handleSave} className="space-y-3">
        <div className="flex items-center gap-3">
            <CurrencyDollarIcon className="w-6 h-6 text-yellow-700"/>
            <p className="font-bold text-gray-800">تسجيل دفعة للمراجع: <span className="text-blue-600">{patient.name}</span></p>
        </div>
        <div>
            <label htmlFor="paymentAmount" className="text-xs font-bold text-gray-600 mb-1 block">المبلغ المدفوع</label>
            <input 
                id="paymentAmount"
                type="number" 
                step="any"
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                className="form-input" 
                required 
                autoFocus 
                placeholder="مثال: 25000"
            />
        </div>
        {error && <p className="text-red-500 text-xs text-center">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-3 rounded-md transition duration-200 text-xs">
            إلغاء
          </button>
          <button type="submit" disabled={isSaving} className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded-md transition duration-200 text-xs disabled:bg-gray-400">
            {isSaving ? 'جاري الحفظ...' : 'حفظ المبلغ'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentInputCard;