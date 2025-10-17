import React, { useState, useRef } from 'react';
import { addPatient } from '../services/firebase.ts';
import { PlusIcon } from './Icons.tsx';
import type { ClinicSettings } from '../types.ts';

interface AdminPanelProps {
  settings: Pick<ClinicSettings, 'showAgeField' | 'showPhoneField' | 'showReasonField' | 'showAmountPaidField'>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ settings }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [age, setAge] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !visitDate) {
      setMessage({ text: 'يرجى إدخال اسم المراجع وتاريخ الزيارة', type: 'error' });
      return;
    }
    // Validation for numeric fields
    if (age && isNaN(parseInt(age, 10))) {
        setMessage({ text: 'يرجى إدخال عمر صحيح (أرقام فقط)', type: 'error' });
        return;
    }
    if (amountPaid && isNaN(parseFloat(amountPaid))) {
        setMessage({ text: 'يرجى إدخال مبلغ صحيح (أرقام فقط)', type: 'error' });
        return;
    }

    setIsSubmitting(true);
    setMessage(null);
    try {
      const dateParts = visitDate.split('-').map(part => parseInt(part, 10));
      const dateForVisit = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

      await addPatient({
        name,
        phone,
        reason,
        visitDate: dateForVisit,
        age: age ? parseInt(age, 10) : undefined,
        amountPaid: amountPaid ? parseFloat(amountPaid) : undefined,
        showDetailsToPublic: showDetails
      });

      setMessage({ text: `تمت إضافة ${name} بنجاح!`, type: 'success' });
      setName('');
      setPhone('');
      setReason('');
      setAge('');
      setAmountPaid('');
      setShowDetails(false);
      setVisitDate(new Date().toISOString().split('T')[0]);
      nameInputRef.current?.focus();
    } catch (error) {
      setMessage({ text: 'حدث خطأ أثناء إضافة المراجع', type: 'error' });
      console.error(error);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">إضافة مراجع جديد</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-1">اسم المراجع</label>
          <input
            ref={nameInputRef}
            id="patientName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-white/50 text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="مثال: أحمد محمد"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {settings.showAgeField && (
            <div>
              <label htmlFor="patientAge" className="block text-sm font-medium text-gray-700 mb-1">العمر</label>
              <input
                id="patientAge"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 bg-white/50 text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="35"
              />
            </div>
          )}
          {settings.showAmountPaidField && (
            <div>
              <label htmlFor="patientAmount" className="block text-sm font-medium text-gray-700 mb-1">دفعة أولية</label>
              <input
                id="patientAmount"
                type="number"
                step="any"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="w-full px-3 py-2 bg-white/50 text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="25000"
              />
            </div>
          )}
        </div>
        {settings.showPhoneField && (
          <div>
            <label htmlFor="patientPhone" className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف (اختياري)</label>
            <input
              id="patientPhone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 bg-white/50 text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="07..."
            />
          </div>
        )}
        {settings.showReasonField && (
          <div>
            <label htmlFor="visitReason" className="block text-sm font-medium text-gray-700 mb-1">سبب الزيارة (اختياري)</label>
            <input
              id="visitReason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-white/50 text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="استشارة, مراجعة, ...الخ"
            />
          </div>
        )}
        <div>
          <label htmlFor="visitDate" className="block text-sm font-medium text-gray-700 mb-1">تاريخ الزيارة</label>
          <input
            id="visitDate"
            type="date"
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
            className="w-full px-3 py-2 bg-white/50 text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />
        </div>
         <div className="pt-2">
          <label className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer">
            <input
              type="checkbox"
              checked={showDetails}
              onChange={(e) => setShowDetails(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">إظهار تفاصيل المراجع على الشاشة العامة</span>
          </label>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 transition-all duration-300 shadow-lg hover:shadow-blue-500/50"
        >
          <PlusIcon className="w-5 h-5"/>
          {isSubmitting ? 'جاري الإضافة...' : 'إضافة إلى القائمة'}
        </button>
      </form>
      {message && (
        <div className={`mt-4 p-3 rounded-lg text-center text-sm font-medium animate-fade-in ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;