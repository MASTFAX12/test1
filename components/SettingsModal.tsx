
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { ClinicSettings, Service } from '../types.ts';
import { XMarkIcon, TrashIcon, PlusIcon, SpinnerIcon, LockClosedIcon } from './Icons.tsx';
import { updateClinicSettings } from '../services/firebase.ts';
import { toast } from 'react-hot-toast';

interface SettingsModalProps {
  settings: ClinicSettings;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onClose }) => {
  const [localSettings, setLocalSettings] = useState<ClinicSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
        setLocalSettings(prev => ({ ...prev, [name]: e.target.checked }));
    } else {
        setLocalSettings(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setLocalSettings(prev => ({ ...prev, [name]: value === '' ? 0 : parseInt(value, 10) }));
  }

  const handleServiceChange = (id: string, field: keyof Service, value: string | number) => {
    const updatedServices = localSettings.services.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    );
    setLocalSettings(prev => ({ ...prev, services: updatedServices }));
  };

  const addService = () => {
    const newService: Service = { id: uuidv4(), name: 'خدمة جديدة', price: 0 };
    setLocalSettings(prev => ({ ...prev, services: [...prev.services, newService] }));
  };

  const removeService = (id: string) => {
    setLocalSettings(prev => ({ ...prev, services: prev.services.filter(s => s.id !== id) }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const savingToast = toast.loading("جاري حفظ الإعدادات...");
    try {
      await updateClinicSettings(localSettings);
      toast.success("تم حفظ الإعدادات بنجاح!", { id: savingToast });
      onClose();
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("فشل حفظ الإعدادات.", { id: savingToast });
    } finally {
      setIsSaving(false);
    }
  };
  
  const renderTabContent = () => {
      switch (activeTab) {
          case 'general': return (
              <div className="space-y-4">
                  <Input name="clinicName" label="اسم العيادة" value={localSettings.clinicName} onChange={handleChange} />
                  <Input name="doctorName" label="اسم الطبيب" value={localSettings.doctorName} onChange={handleChange} />
                  <Input name="clinicSpecialty" label="تخصص العيادة" value={localSettings.clinicSpecialty} onChange={handleChange} />
                  <TextArea name="publicMessage" label="رسالة الشاشة العامة" value={localSettings.publicMessage} onChange={handleChange} />
              </div>
          );
          case 'appearance': return (
              <div className="space-y-4">
                  <Input name="themeColor" label="اللون الأساسي" type="color" value={localSettings.themeColor} onChange={handleChange} className="p-1 h-10" />
                  <Input name="marqueeSpeed" label="سرعة الشريط الإخباري (ثواني)" type="number" value={localSettings.marqueeSpeed.toString()} onChange={handleNumberChange} />
                  <Checkbox name="callSoundEnabled" label="تفعيل صوت النداء" checked={localSettings.callSoundEnabled} onChange={handleChange} />
              </div>
          );
          case 'fields': return (
              <div className="space-y-3">
                  <h3 className="font-semibold text-gray-700">حقول استمارة إضافة مراجع:</h3>
                  <Checkbox name="showAgeField" label="إظهار حقل العمر" checked={localSettings.showAgeField} onChange={handleChange} />
                  <Checkbox name="showPhoneField" label="إظهار حقل الهاتف" checked={localSettings.showPhoneField} onChange={handleChange} />
                  <Checkbox name="showReasonField" label="إظهار حقل سبب الزيارة" checked={localSettings.showReasonField} onChange={handleChange} />
                  <Checkbox name="showAmountPaidField" label="إظهار حقل الدفعة الأولية" checked={localSettings.showAmountPaidField} onChange={handleChange} />
              </div>
          );
          case 'services': return (
              <div>
                  <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-gray-700">الخدمات والأسعار</h3>
                      <button onClick={addService} className="flex items-center gap-1 bg-blue-500 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-blue-600 transition"><PlusIcon className="w-4 h-4" /> إضافة</button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {localSettings.services.map(service => (
                          <div key={service.id} className="flex items-center gap-2 bg-gray-100 p-2 rounded-md">
                              <input type="text" value={service.name} onChange={e => handleServiceChange(service.id, 'name', e.target.value)} placeholder="اسم الخدمة" className="form-input flex-grow" />
                              <input type="number" value={service.price} onChange={e => handleServiceChange(service.id, 'price', parseInt(e.target.value, 10) || 0)} placeholder="السعر" className="form-input w-28" />
                              <button onClick={() => removeService(service.id)} className="p-2 text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4"/></button>
                          </div>
                      ))}
                  </div>
              </div>
          );
          case 'security': return (
              <div className="space-y-4">
                  <Input name="doctorPassword" type="password" label="كلمة مرور الطبيب" value={localSettings.doctorPassword || ''} onChange={handleChange} icon={<LockClosedIcon className="w-4 h-4 text-gray-400"/>} />
                  <Input name="secretaryPassword" type="password" label="كلمة مرور السكرتير" value={localSettings.secretaryPassword || ''} onChange={handleChange} icon={<LockClosedIcon className="w-4 h-4 text-gray-400"/>} />
              </div>
          );
          default: return null;
      }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">إعدادات العيادة</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </header>

        <div className="flex-grow p-6 overflow-y-auto">
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-4 rtl:space-x-reverse" aria-label="Tabs">
                    <Tab name="عام" id="general" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <Tab name="الخدمات" id="services" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <Tab name="المظهر" id="appearance" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <Tab name="الحقول" id="fields" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <Tab name="الأمان" id="security" activeTab={activeTab} setActiveTab={setActiveTab} />
                </nav>
            </div>
            {renderTabContent()}
        </div>

        <footer className="p-4 border-t bg-gray-50 rounded-b-2xl flex justify-end gap-3">
          <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors">
            إلغاء
          </button>
          <button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-400 flex items-center gap-2">
            {isSaving && <SpinnerIcon className="w-5 h-5" />}
            {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </footer>
      </div>
    </div>
  );
};

const Tab: React.FC<{name: string, id: string, activeTab: string, setActiveTab: (id: string) => void}> = ({name, id, activeTab, setActiveTab}) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`${
            activeTab === id
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
    >
        {name}
    </button>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & {label: string, icon?: React.ReactNode, className?: string}> = ({label, name, ...props}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="relative">
            {props.icon && <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">{props.icon}</div>}
            <input id={name} name={name} {...props} className={`form-input ${props.icon ? 'pl-10' : ''} ${props.className || ''}`} />
        </div>
    </div>
);

const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & {label: string}> = ({label, name, ...props}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <textarea id={name} name={name} rows={3} {...props} className="form-input" />
    </div>
);

const Checkbox: React.FC<React.InputHTMLAttributes<HTMLInputElement> & {label: string}> = ({label, name, ...props}) => (
    <label htmlFor={name} className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer bg-gray-50 p-3 rounded-md hover:bg-gray-100">
        <input id={name} name={name} type="checkbox" {...props} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
        <span className="text-sm font-medium text-gray-800">{label}</span>
    </label>
);

export default SettingsModal;
