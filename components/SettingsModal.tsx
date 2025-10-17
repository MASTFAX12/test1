import React, { useState, useEffect } from 'react';
import { updateClinicSettings } from '../services/firebase.ts';
import type { ClinicSettings, Service } from '../types.ts';
import { XMarkIcon, PaintBrushIcon, TrashIcon, PlusIcon } from './Icons.tsx';
import { v4 as uuidv4 } from 'uuid';


interface SettingsModalProps {
  settings: ClinicSettings;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onClose }) => {
  const [formData, setFormData] = useState<ClinicSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  // Service management state
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');

  useEffect(() => {
    // Ensure services is always an array
    setFormData({ ...settings, services: settings.services || [] });
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleServiceChange = (id: string, field: 'name' | 'price', value: string) => {
      const updatedServices = formData.services.map(service => {
          if (service.id === id) {
              return { ...service, [field]: field === 'price' ? parseFloat(value) || 0 : value };
          }
          return service;
      });
      setFormData(prev => ({ ...prev, services: updatedServices }));
  };

  const handleAddService = () => {
    if (newServiceName && newServicePrice) {
        const newService: Service = {
            id: uuidv4(),
            name: newServiceName,
            price: parseFloat(newServicePrice)
        };
        setFormData(prev => ({...prev, services: [...prev.services, newService]}));
        setNewServiceName('');
        setNewServicePrice('');
    }
  };

  const handleDeleteService = (id: string) => {
      const updatedServices = formData.services.filter(s => s.id !== id);
      setFormData(prev => ({ ...prev, services: updatedServices }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    try {
      const settingsToUpdate: Partial<ClinicSettings> = { ...formData };
      if (!formData.doctorPassword) delete settingsToUpdate.doctorPassword;
      if (!formData.secretaryPassword) delete settingsToUpdate.secretaryPassword;

      await updateClinicSettings(settingsToUpdate);
      setMessage('تم حفظ الإعدادات بنجاح!');
      setTimeout(() => {
        setMessage('');
      }, 2000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setMessage('حدث خطأ أثناء حفظ الإعدادات.');
    } finally {
      setIsSaving(false);
    }
  };
  

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-800">إعدادات الطبيب</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </header>
        
        <form onSubmit={handleSave} className="flex-grow overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Service Management */}
            <fieldset className="border p-4 rounded-lg">
                <legend className="text-lg font-bold text-gray-700 px-2">إدارة الخدمات الطبية</legend>
                <div className="space-y-2">
                    {formData.services.map(service => (
                        <div key={service.id} className="flex items-center gap-2">
                            <input type="text" value={service.name} onChange={e => handleServiceChange(service.id, 'name', e.target.value)} className="input-style flex-grow" placeholder="اسم الخدمة"/>
                            <input type="number" value={service.price} onChange={e => handleServiceChange(service.id, 'price', e.target.value)} className="input-style w-32" placeholder="السعر"/>
                            <button type="button" onClick={() => handleDeleteService(service.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                    <input type="text" value={newServiceName} onChange={e => setNewServiceName(e.target.value)} className="input-style flex-grow" placeholder="اسم خدمة جديد"/>
                    <input type="number" value={newServicePrice} onChange={e => setNewServicePrice(e.target.value)} className="input-style w-32" placeholder="السعر"/>
                    <button type="button" onClick={handleAddService} className="p-2 text-green-500 bg-green-100 hover:bg-green-200 rounded-full"><PlusIcon className="w-5 h-5"/></button>
                </div>
            </fieldset>

            {/* Form Fields Management */}
            <fieldset className="border p-4 rounded-lg">
                <legend className="text-lg font-bold text-gray-700 px-2">إدارة حقول الإدخال</legend>
                <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer"><input type="checkbox" name="showAgeField" checked={formData.showAgeField} onChange={handleChange} className="checkbox-style" /><span>عرض حقل العمر</span></label>
                    <label className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer"><input type="checkbox" name="showPhoneField" checked={formData.showPhoneField} onChange={handleChange} className="checkbox-style" /><span>عرض حقل الهاتف</span></label>
                    <label className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer"><input type="checkbox" name="showReasonField" checked={formData.showReasonField} onChange={handleChange} className="checkbox-style" /><span>عرض حقل سبب الزيارة</span></label>
                    <label className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer"><input type="checkbox" name="showAmountPaidField" checked={formData.showAmountPaidField} onChange={handleChange} className="checkbox-style" /><span>عرض حقل دفعة أولية</span></label>
                </div>
            </fieldset>
            
            {/* Public View Customization */}
            <fieldset className="border p-4 rounded-lg">
                <legend className="text-lg font-bold text-gray-700 px-2">تخصيص الواجهة العامة</legend>
                <div>
                  <label className="block text-sm font-medium text-gray-700">رسالة الشريط المتحرك</label>
                  <textarea name="publicMessage" value={formData.publicMessage} onChange={handleChange} rows={2} className="mt-1 w-full input-style"></textarea>
                </div>
                <div>
                   <label htmlFor="marqueeSpeed" className="block text-sm font-medium text-gray-700">سرعة الشريط (ثانية)</label>
                   <div className="flex items-center gap-4">
                     <input id="marqueeSpeed" type="range" name="marqueeSpeed" min="5" max="60" value={formData.marqueeSpeed} onChange={handleChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"/>
                     <span className="font-bold text-blue-600">{formData.marqueeSpeed}</span>
                   </div>
                </div>
            </fieldset>

            {/* Passwords */}
            <fieldset className="border p-4 rounded-lg">
                <legend className="text-lg font-bold text-gray-700 px-2">الأمان</legend>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">كلمة مرور الطبيب</label>
                        <input type="password" name="doctorPassword" value={formData.doctorPassword || ''} onChange={handleChange} className="mt-1 w-full input-style" placeholder="اتركه فارغاً لعدم التغيير" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">كلمة مرور السكرتير</label>
                        <input type="password" name="secretaryPassword" value={formData.secretaryPassword || ''} onChange={handleChange} className="mt-1 w-full input-style" placeholder="اتركه فارغاً لعدم التغيير" />
                    </div>
                </div>
            </fieldset>
          </div>
        </form>

        <footer className="flex justify-between items-center p-4 border-t bg-gray-50 rounded-b-2xl flex-shrink-0">
           {message && <div className={`text-sm font-medium ${message.includes('خطأ') ? 'text-red-600' : 'text-green-600'}`}>{message}</div>}
           <div className="flex-grow"></div>
           <div className="flex gap-2">
             <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition">إغلاق</button>
             <button type="button" onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-gray-400">
                {isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
             </button>
           </div>
        </footer>
      </div>
      <style>{`
        .input-style { box-sizing: border-box; width: 100%; padding: 0.5rem 0.75rem; background-color: white; border: 1px solid #D1D5DB; border-radius: 0.5rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); transition: border-color 0.2s, box-shadow 0.2s; } .input-style:focus { outline: none; border-color: #3B82F6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4); }
        .checkbox-style { height: 1.25rem; width: 1.25rem; border-radius: 0.25rem; border-color: #D1D5DB; color: #2563EB; focus:ring-blue-500; }
      `}</style>
    </div>
  );
};

export default SettingsModal;