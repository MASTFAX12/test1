import React, { useState, FC } from 'react';
import { SpinnerIcon, XMarkIcon, UserIcon, CakeIcon, PhoneIcon } from './Icons.tsx';
import type { PatientProfile } from '../types.ts';
import { updatePatientProfile } from '../services/firebase.ts';
import { toast } from 'react-hot-toast';

interface EditPatientProfileModalProps {
  profile: PatientProfile;
  onClose: () => void;
}

const EditPatientProfileModal: FC<EditPatientProfileModalProps> = ({ profile, onClose }) => {
    const [name, setName] = useState(profile.name);
    const [phone, setPhone] = useState(profile.phone || '');
    const [age, setAge] = useState(profile.age?.toString() || '');
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<{ phone?: string; age?: string }>({});

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: { phone?: string; age?: string } = {};

        if (!name.trim()) {
          toast.error('اسم المراجع مطلوب.');
          return;
        }

        if (age) {
            const ageNum = parseInt(age, 10);
            if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
                newErrors.age = 'العمر يجب أن يكون رقماً بين 0 و 120.';
            }
        }
        
        const phoneRegex = /^\+?[0-9\s()-]*$/;
        if (phone && !phoneRegex.test(phone)) {
            newErrors.phone = 'يسمح فقط بالأرقام، المسافات، ()، - وعلامة + في البداية.';
        }
        
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        setIsSaving(true);
        try {
            const ageNum = age ? parseInt(age, 10) : null;
            await updatePatientProfile(profile.id, {
                name: name.trim(),
                phone: phone.trim() || null,
                age: ageNum,
            });
            toast.success('تم تحديث بيانات المراجع بنجاح.');
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('فشل تحديث البيانات.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <header className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">تعديل بيانات المراجع</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><XMarkIcon className="w-6 h-6 text-gray-600" /></button>
                </header>
                <form id="edit-profile-form" onSubmit={handleSave} className="flex-grow p-6 space-y-5 overflow-y-auto">
                    <div>
                        <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1.5">الاسم الكامل <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400"><UserIcon className="w-5 h-5"/></div>
                            <input id="edit-name" value={name} onChange={e => setName(e.target.value)} className="form-input !pr-10" required autoFocus />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="edit-age" className="block text-sm font-medium text-gray-700 mb-1.5">العمر</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400"><CakeIcon className="w-5 h-5"/></div>
                            <input id="edit-age" value={age} onChange={e => { if (/^\d*$/.test(e.target.value)) { setAge(e.target.value); if (errors.age) setErrors(p => ({...p, age: undefined})); } }} className={`form-input !pr-10 ${errors.age ? 'border-red-500' : ''}`} type="text" inputMode="numeric" />
                        </div>
                        {errors.age && <p className="mt-1.5 text-xs text-red-600">{errors.age}</p>}
                    </div>
                     <div>
                        <label htmlFor="edit-phone" className="block text-sm font-medium text-gray-700 mb-1.5">رقم الهاتف</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400"><PhoneIcon className="w-5 h-5"/></div>
                            <input id="edit-phone" value={phone} onChange={e => { setPhone(e.target.value); if (errors.phone) setErrors(p => ({...p, phone: undefined})); }} className={`form-input !pr-10 ${errors.phone ? 'border-red-500' : ''}`} type="tel" />
                        </div>
                        {errors.phone && <p className="mt-1.5 text-xs text-red-600">{errors.phone}</p>}
                    </div>
                </form>
                <footer className="p-4 border-t bg-gray-50/70 flex-shrink-0 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 font-bold py-2.5 px-6 rounded-lg shadow-sm">إلغاء</button>
                    <button type="submit" form="edit-profile-form" disabled={isSaving} className="w-40 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg shadow-md text-white bg-[var(--theme-color)] hover:opacity-90 disabled:bg-gray-400 transition-all">
                        {isSaving && <SpinnerIcon className="w-5 h-5" />}
                        {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default EditPatientProfileModal;
