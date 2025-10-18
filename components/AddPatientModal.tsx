import React, { useState, FC } from 'react';
import { SpinnerIcon, XMarkIcon, UserIcon, CakeIcon, PhoneIcon, PencilIcon, CurrencyDollarIcon } from './Icons.tsx';
import type { ClinicSettings } from '../types.ts';
import { addPatientVisit } from '../services/firebase.ts';
import { toast } from 'react-hot-toast';

interface AddPatientModalProps {
  settings: ClinicSettings;
  onClose: () => void;
}

const InputField: FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; icon: React.ReactNode; isOptional?: boolean; }> = ({ label, icon, id, isOptional, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label} {!isOptional && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400">
                {icon}
            </div>
            <input id={id} {...props} className="form-input !pr-10 border-2 border-slate-200" />
        </div>
    </div>
);

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

    // Validate phone number format
    const phoneRegex = /^\+?[0-9\s()-]*$/;
    if (phone && !phoneRegex.test(phone)) {
        toast.error('رقم الهاتف يحتوي على رموز غير صالحة. يسمح فقط بعلامة + في البداية.');
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
            <form onSubmit={handleSubmit} className="flex-grow p-6 space-y-5 overflow-y-auto">
                <InputField
                  id="name"
                  label="الاسم الكامل"
                  icon={<UserIcon className="w-5 h-5" />}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                  placeholder="مثال: أحمد محمد"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {settings.showAgeField && (
                      <InputField
                          id="age"
                          label="العمر"
                          icon={<CakeIcon className="w-5 h-5" />}
                          isOptional
                          type="text"
                          inputMode="numeric"
                          value={age}
                          onChange={(e) => { if (/^\d*$/.test(e.target.value)) setAge(e.target.value); }}
                          placeholder="مثال: 35"
                      />
                  )}

                  {settings.showPhoneField && (
                      <InputField
                          id="phone"
                          label="رقم الهاتف"
                          icon={<PhoneIcon className="w-5 h-5" />}
                          isOptional
                          type="tel"
                          value={phone}
                          onChange={(e) => { if (/^\+?[0-9\s()-]*$/.test(e.target.value)) setPhone(e.target.value); }}
                          placeholder="مثال: +964 770 123 4567"
                      />
                  )}
                </div>
                
                {settings.showReasonField && (
                     <InputField
                          id="reason"
                          label="سبب الزيارة"
                          icon={<PencilIcon className="w-5 h-5" />}
                          isOptional
                          type="text"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="مثال: مراجعة عامة"
                      />
                )}
                
                {settings.showAmountPaidField && (
                     <InputField
                          id="amountPaid"
                          label="الدفعة الأولية"
                          icon={<CurrencyDollarIcon className="w-5 h-5" />}
                          isOptional
                          type="text"
                          inputMode="decimal"
                          value={amountPaid}
                          onChange={(e) => { if (/^\d*\.?\d*$/.test(e.target.value)) setAmountPaid(e.target.value); }}
                          placeholder="مثال: 10000"
                      />
                )}
                
                <div className="pt-2">
                    <label htmlFor="showDetailsToPublic" className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200/80 cursor-pointer hover:bg-gray-100/60 transition-colors">
                      <span className="font-medium text-gray-700 text-sm">إظهار سبب الزيارة على الشاشة العامة</span>
                      <div className="relative inline-flex items-center cursor-pointer">
                          <input
                              id="showDetailsToPublic"
                              type="checkbox"
                              checked={showDetailsToPublic}
                              onChange={(e) => setShowDetailsToPublic(e.target.checked)}
                              className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-offset-1 peer-focus:ring-[var(--theme-color)] peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] rtl:after:right-[1px] rtl:after:left-auto after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--theme-color)]"></div>
                      </div>
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