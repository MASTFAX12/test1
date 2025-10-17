import React, { useState } from 'react';
import { SpinnerIcon, XMarkIcon } from './Icons.tsx';
import type { ClinicSettings } from '../types.ts';
import { addPatientVisit } from '../services/firebase.ts';
import { toast } from 'react-hot-toast';

interface AddPatientModalProps {
  settings: ClinicSettings;
  onClose: () => void;
}

const AddPatientModal: React.FC<AddPatientModalProps> = ({ settings, onClose }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [age, setAge] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [showDetailsToPublic, setShowDetailsToPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('الرجاء إدخال اسم المراجع.');
      return;
    }
    const ageNum = age ? parseInt(age, 10) : undefined;
    if (age && (isNaN(ageNum) || ageNum < 0 || ageNum > 120)) {
        toast.error('يرجى إدخال عمر صحيح (بين 0 و 120).');
        return;
    }

    setIsSubmitting(true);
    try {
      await addPatientVisit({
        name,
        phone,
        reason,
        age: ageNum,
        amountPaid: amountPaid ? parseFloat(amountPaid) : undefined,
        showDetailsToPublic,
      });
      toast.success(`تمت إضافة "${name}" إلى قائمة الانتظار.`);
      onClose(); // Close modal on success
    } catch (error) {
      console.error("Failed to add patient:", error);
      toast.error('حدث خطأ أثناء إضافة المراجع.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <header className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-bold text-gray-800">إضافة مراجع جديد</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                    <XMarkIcon className="w-6 h-6 text-gray-600" />
                </button>
            </header>
            <form onSubmit={handleSubmit} className="flex-grow p-6 space-y-4 overflow-y-auto">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل *</label>
                  <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="form-input" required autoFocus placeholder="مثال: أحمد محمد" />
                </div>
                
                {settings.showAgeField && (
                    <div>
                        <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">العمر</label>
                        <input type="text" inputMode="numeric" id="age" value={age} onChange={(e) => { if (/^\d*$/.test(e.target.value)) setAge(e.target.value); }} className="form-input" placeholder="مثال: 35"/>
                    </div>
                )}

                {settings.showPhoneField && (
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                        <input type="tel" id="phone" value={phone} onChange={(e) => { if (/^[0-9\s+()-]*$/.test(e.target.value)) setPhone(e.target.value); }} className="form-input" placeholder="مثال: 07701234567"/>
                    </div>
                )}
                
                {settings.showReasonField && (
                    <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">سبب الزيارة</label>
                        <input type="text" id="reason" value={reason} onChange={(e) => setReason(e.target.value)} className="form-input" placeholder="مثال: مراجعة عامة"/>
                    </div>
                )}
                
                {settings.showAmountPaidField && (
                     <div>
                        <label htmlFor="amountPaid" className="block text-sm font-medium text-gray-700 mb-1">الدفعة الأولية</label>
                        <input type="text" inputMode="decimal" id="amountPaid" step="any" value={amountPaid} onChange={(e) => { if (/^\d*\.?\d*$/.test(e.target.value)) setAmountPaid(e.target.value); }} className="form-input" placeholder="مثال: 10000"/>
                    </div>
                )}
                
                <div className="pt-2">
                    <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                      <input id="showDetailsToPublic" name="showDetailsToPublic" type="checkbox" checked={showDetailsToPublic} onChange={(e) => setShowDetailsToPublic(e.target.checked)} className="focus:ring-[var(--theme-color)] h-4 w-4 text-[var(--theme-color)] border-gray-300 rounded"/>
                      <span className="font-medium text-gray-700 text-sm">إظهار سبب الزيارة على الشاشة العامة</span>
                    </label>
                </div>
            </form>
             <footer className="p-4 border-t bg-gray-50/70 flex-shrink-0 flex justify-end gap-3">
                 <button type="button" onClick={onClose} className="bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm">
                    إلغاء
                </button>
                <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="w-48 flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[var(--theme-color)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--theme-color)] disabled:bg-gray-400 transition-opacity">
                  {isSubmitting && <SpinnerIcon className="w-4 h-4" />}
                  {isSubmitting ? 'جاري الإضافة...' : 'إضافة إلى القائمة'}
                </button>
            </footer>
        </div>
    </div>
  );
};

export default AddPatientModal;