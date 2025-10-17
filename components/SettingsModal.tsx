import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { ClinicSettings, Service } from '../types.ts';
import { 
    XMarkIcon, 
    TrashIcon, 
    PlusIcon, 
    SpinnerIcon, 
    Cog8ToothIcon,
    CurrencyDollarIcon,
    PaintBrushIcon,
    ClipboardDocumentListIcon,
    CheckIcon,
    LockClosedIcon,
    EyeIcon,
    EyeSlashIcon
} from './Icons.tsx';
import { updateClinicSettings } from '../services/firebase.ts';
import { toast } from 'react-hot-toast';

interface SettingsModalProps {
  settings: ClinicSettings;
  onClose: () => void;
}

const themeColors = [
    { name: 'Default Blue', color: '#2563eb' },
    { name: 'Emerald Green', color: '#10b981' },
    { name: 'Rose Pink', color: '#f43f5e' },
    { name: 'Indigo Purple', color: '#6366f1' },
    { name: 'Slate Gray', color: '#475569' },
    { name: 'Amber Orange', color: '#f59e0b' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onClose }) => {
  const [localSettings, setLocalSettings] = useState<ClinicSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showDoctorPass, setShowDoctorPass] = useState(false);
  const [showSecretaryPass, setShowSecretaryPass] = useState(false);


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
      return (
        <div className="animate-fade-in">
            {activeTab === 'general' && (
              <>
                <h3 className="text-2xl font-bold text-gray-800 mb-8">الإعدادات العامة</h3>
                <div className="space-y-6">
                    <Input name="clinicName" label="اسم العيادة" value={localSettings.clinicName} onChange={handleChange} />
                    <Input name="doctorName" label="اسم الطبيب" value={localSettings.doctorName} onChange={handleChange} />
                    <Input name="clinicSpecialty" label="تخصص العيادة" value={localSettings.clinicSpecialty} onChange={handleChange} />
                    <TextArea name="publicMessage" label="رسالة الشاشة العامة" value={localSettings.publicMessage} onChange={handleChange} />
                </div>
              </>
            )}
            {activeTab === 'appearance' && (
              <>
                <h3 className="text-2xl font-bold text-gray-800 mb-8">المظهر والتخصيص</h3>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">اللون الأساسي</label>
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                                {themeColors.map(theme => (
                                    <button
                                        key={theme.color}
                                        type="button"
                                        onClick={() => setLocalSettings(prev => ({ ...prev, themeColor: theme.color }))}
                                        className="w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center"
                                        style={{ backgroundColor: theme.color }}
                                        title={theme.name}
                                    >
                                        {localSettings.themeColor === theme.color && <CheckIcon className="w-5 h-5 text-white" />}
                                    </button>
                                ))}
                            </div>
                            <div className="relative">
                                <input 
                                name="themeColor" 
                                type="color" 
                                value={localSettings.themeColor} 
                                onChange={handleChange} 
                                className="w-10 h-10 p-1 bg-white border border-gray-300 rounded-md cursor-pointer" 
                                />
                            </div>
                        </div>
                    </div>
                    <Input name="marqueeSpeed" label="سرعة الشريط الإخباري (ثواني)" type="number" value={localSettings.marqueeSpeed.toString()} onChange={handleNumberChange} />
                    <Checkbox name="callSoundEnabled" label="تفعيل صوت النداء" checked={localSettings.callSoundEnabled} onChange={handleChange} description="تشغيل صوت عند إضافة مراجع أو النداء عليه." />
                </div>
              </>
          )}
          {activeTab === 'fields' && (
            <>
                <h3 className="text-2xl font-bold text-gray-800 mb-8">حقول الإدخال</h3>
                <div className="space-y-4">
                    <p className="text-gray-600">اختر الحقول التي تظهر في استمارة إضافة مراجع جديد.</p>
                    <Checkbox name="showAgeField" label="إظهار حقل العمر" checked={localSettings.showAgeField} onChange={handleChange} />
                    <Checkbox name="showPhoneField" label="إظهار حقل الهاتف" checked={localSettings.showPhoneField} onChange={handleChange} />
                    <Checkbox name="showReasonField" label="إظهار حقل سبب الزيارة" checked={localSettings.showReasonField} onChange={handleChange} />
                    <Checkbox name="showAmountPaidField" label="إظهار حقل الدفعة الأولية" checked={localSettings.showAmountPaidField} onChange={handleChange} />
                </div>
            </>
          )}
          {activeTab === 'services' && (
            <>
                <h3 className="text-2xl font-bold text-gray-800 mb-8">الخدمات والأسعار</h3>
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-gray-600">إدارة الخدمات والأسعار التي تقدمها العيادة.</p>
                        <button onClick={addService} className="flex items-center gap-1.5 bg-blue-500 text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition shadow-sm"><PlusIcon className="w-4 h-4" /> إضافة خدمة</button>
                    </div>
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2 -mr-2">
                        {localSettings.services.map((service, index) => (
                            <div key={service.id} className={`flex items-center gap-3 p-3 rounded-lg ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                <input type="text" value={service.name} onChange={e => handleServiceChange(service.id, 'name', e.target.value)} placeholder="اسم الخدمة" className="form-input flex-grow" />
                                <input type="number" value={service.price} onChange={e => handleServiceChange(service.id, 'price', parseInt(e.target.value, 10) || 0)} placeholder="السعر" className="form-input w-32 text-left" />
                                <button onClick={() => removeService(service.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full transition"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        ))}
                        {localSettings.services.length === 0 && (
                            <p className="text-center text-gray-500 py-6">لا توجد خدمات معرفة.</p>
                        )}
                    </div>
                </div>
            </>
          )}
          {activeTab === 'security' && (
            <>
                <h3 className="text-2xl font-bold text-gray-800 mb-8">الأمان وكلمات المرور</h3>
                <div className="space-y-6">
                    <PasswordInput 
                        name="doctorPassword" 
                        label="كلمة مرور الطبيب" 
                        value={localSettings.doctorPassword || ''}
                        onChange={handleChange}
                        showPassword={showDoctorPass}
                        toggleShowPassword={() => setShowDoctorPass(p => !p)}
                    />
                     <PasswordInput 
                        name="secretaryPassword" 
                        label="كلمة مرور السكرتير" 
                        value={localSettings.secretaryPassword || ''}
                        onChange={handleChange}
                        showPassword={showSecretaryPass}
                        toggleShowPassword={() => setShowSecretaryPass(p => !p)}
                    />
                </div>
            </>
          )}
        </div>
      );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-full max-h-[680px] flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-1/4 bg-gray-50 p-4 border-l border-gray-200">
             <header className="flex justify-between items-center p-2 mb-6">
                <h2 className="text-lg font-bold text-gray-800">الإعدادات</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 lg:hidden">
                    <XMarkIcon className="w-6 h-6 text-gray-600" />
                </button>
            </header>
            <nav className="flex flex-col gap-2">
                <SideTab id="general" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Cog8ToothIcon className="w-5 h-5"/>} label="عام" />
                <SideTab id="services" activeTab={activeTab} setActiveTab={setActiveTab} icon={<CurrencyDollarIcon className="w-5 h-5"/>} label="الخدمات" />
                <SideTab id="appearance" activeTab={activeTab} setActiveTab={setActiveTab} icon={<PaintBrushIcon className="w-5 h-5"/>} label="المظهر" />
                <SideTab id="fields" activeTab={activeTab} setActiveTab={setActiveTab} icon={<ClipboardDocumentListIcon className="w-5 h-5"/>} label="الحقول" />
                <SideTab id="security" activeTab={activeTab} setActiveTab={setActiveTab} icon={<LockClosedIcon className="w-5 h-5"/>} label="الأمان" />
            </nav>
        </aside>

        {/* Main Content */}
        <main className="w-3/4 flex flex-col">
          <div className="flex-grow p-8 overflow-y-auto">
            {renderTabContent()}
          </div>
          <footer className="p-4 border-t bg-gray-50/70 flex justify-between items-center">
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 hidden lg:block">
                <XMarkIcon className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex justify-end gap-3 w-full">
                <button type="button" onClick={onClose} className="bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm">
                    إلغاء
                </button>
                <button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors disabled:bg-gray-400 flex items-center gap-2 shadow-sm">
                    {isSaving && <SpinnerIcon className="w-5 h-5" />}
                    {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

const SideTab: React.FC<{id: string, activeTab: string, setActiveTab: (id: string) => void, icon: React.ReactNode, label: string}> = ({id, activeTab, setActiveTab, icon, label}) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`w-full flex items-center gap-3 text-right px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === id
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-600 hover:bg-gray-200/60'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & {label: string}> = ({label, name, ...props}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        <input id={name} name={name} {...props} className="form-input" />
    </div>
);

const PasswordInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & {label: string, showPassword?: boolean, toggleShowPassword?: () => void}> = ({label, name, showPassword, toggleShowPassword, ...props}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        <div className="relative">
            <input id={name} name={name} {...props} type={showPassword ? 'text' : 'password'} className="form-input" />
            <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute inset-y-0 left-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            >
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
        </div>
    </div>
);


const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & {label: string}> = ({label, name, ...props}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        <textarea id={name} name={name} rows={4} {...props} className="form-input" />
    </div>
);

const Checkbox: React.FC<React.InputHTMLAttributes<HTMLInputElement> & {label: string, description?: string}> = ({label, name, description, ...props}) => (
    <div className="relative flex items-start">
        <div className="flex h-6 items-center">
            <input id={name} name={name} type="checkbox" {...props} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
        </div>
        <div className="mr-3 text-sm leading-6 rtl:ml-3 rtl:mr-0">
            <label htmlFor={name} className="font-medium text-gray-900 cursor-pointer">{label}</label>
            {description && <p className="text-gray-500">{description}</p>}
        </div>
    </div>
);

export default SettingsModal;
