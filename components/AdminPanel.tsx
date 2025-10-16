
import React, { useState } from 'react';
import { addPatient } from '../services/firebase';

const AdminPanel: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setMessage({ text: 'يرجى إدخال اسم المريض', type: 'error' });
      return;
    }
    setIsSubmitting(true);
    setMessage(null);
    try {
      await addPatient(name, phone, reason);
      setMessage({ text: `تمت إضافة ${name} بنجاح!`, type: 'success' });
      setName('');
      setPhone('');
      setReason('');
    } catch (error) {
      setMessage({ text: 'حدث خطأ أثناء إضافة المريض', type: 'error' });
      console.error(error);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border-2 border-blue-500/20 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">إضافة مراجع جديد</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-1">اسم المراجع</label>
          <input
            id="patientName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="مثال: أحمد محمد"
            required
          />
        </div>
        <div>
          <label htmlFor="patientPhone" className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف (اختياري)</label>
          <input
            id="patientPhone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="07..."
          />
        </div>
        <div>
          <label htmlFor="visitReason" className="block text-sm font-medium text-gray-700 mb-1">سبب الزيارة (اختياري)</label>
          <input
            id="visitReason"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="استشارة, مراجعة, ...الخ"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 transition-colors"
        >
          {isSubmitting ? 'جاري الإضافة...' : 'إضافة إلى القائمة'}
        </button>
      </form>
      {message && (
        <div className={`mt-4 p-3 rounded-md text-center text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
