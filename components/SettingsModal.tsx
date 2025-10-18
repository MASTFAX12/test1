import React, { useState, useEffect, FC } from 'react';
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
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  BuildingOffice2Icon,
  AcademicCapIcon,
  SparklesIcon,
  MegaphoneIcon,
  ClockIcon,
  CakeIcon,
  PhoneIcon,
  PencilIcon as PencilSquareIcon,
} from './Icons.tsx';
import { updateClinicSettings } from '../services/firebase.ts';
import { toast } from 'react-hot-toast';

interface SettingsModalProps {
  settings: ClinicSettings;
  onClose: () => void;
}

const themeCards = [
    { name: 'Default Blue', color: '#2563eb' },
    { name: 'Emerald Green', color: '#10b981' },
    { name: 'Rose Pink', color: '#f43f5e' },
    { name: 'Indigo Purple', color: '#6366f1' },
    { name: 'Slate Gray', color: '#475569' },
    { name: 'Amber Orange', color: '#f59e0b' },
];

const ThemeCard: FC<{ theme: typeof themeCards[0]; isSelected: boolean; onSelect: () => void; }> = ({ theme, isSelected, onSelect }) => (
    <button
        type="button"
        onClick={onSelect}
        className={`w-full rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ring-[var(--theme-color)] overflow-hidden shadow-sm group ${isSelected ? 'border-[var(--theme-color)] shadow-lg' : 'border-gray-200 hover:border-gray-300'}`}
    >
        <div className="w-full h-28 rounded-t-lg p-3 bg-gray-100 transition group-hover:bg-gray-200/60">
            <div className="h-full rounded-md shadow-sm bg-white p-2 space-y-2">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.color, opacity: 0.8 }}></div>
                    <div className="h-2 flex-1 rounded-sm" style={{ backgroundColor: theme.color, opacity: 0.6 }}></div>
                </div>
                <div className="h-2 w-3/4 rounded-sm bg-gray-200"></div>
                <div className="h-2 w-1/2 rounded-sm bg-gray-200"></div>
            </div>
        </div>
        <div className="p-3 text-center bg-white rounded-b-lg flex items-center justify-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.color }}></div>
            <p className="font-semibold text-sm text-gray-700">{theme.name}</p>
        </div>
    </button>
);


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
    const newService: Service = { id: uuidv4(), name: '', price: 0 };
    setLocalSettings(prev => ({ ...prev, services: [...prev.services, newService] }));
  };

  const removeService = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الخدمة؟ لا يمكن التراجع عن هذا الإجراء.')) {
      setLocalSettings(prev => ({ ...prev, services: prev.services.filter(s => s.id !== id) }));
      toast.success('تمت إزالة الخدمة. اضغط "حفظ" لتأكيد التغييرات.');
    }
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
              <Section title="المعلومات الأساسية" description="إدارة المعلومات الرئيسية التي تظهر للعموم.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-1">
                        <Input icon={<BuildingOffice2Icon className="w-5 h-5"/>} name="clinicName" label="اسم العيادة" value={localSettings.clinicName} onChange={handleChange} />
                    </div>
                    <div className="md:col-span-1">
                        <Input icon={<AcademicCapIcon className="w-5 h-5"/>} name="doctorName" label="اسم الطبيب" value={localSettings.doctorName} onChange={handleChange} />
                    </div>
                    <div className="md:col-span-2">
                        <Input icon={<SparklesIcon className="w-5 h-5"/>} name="clinicSpecialty" label="تخصص العيادة" value={localSettings.clinicSpecialty} onChange={handleChange} />
                    </div>
                    <div className="md:col-span-2">
                        <TextArea icon={<MegaphoneIcon className="w-5 h-5"/>} name="publicMessage" label="رسالة الشاشة العامة" value={localSettings.publicMessage} onChange={handleChange} />
                    </div>
                </div>
              </Section>
            )}
            {activeTab === 'appearance' && (
              <>
                <Section title="الثيم والألوان" description="اختر المظهر العام للتطبيق ليتناسب مع هوية عيادتك.">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {themeCards.map(theme => (
                            <ThemeCard
                                key={theme.color}
                                theme={theme}
                                isSelected={localSettings.themeColor === theme.color}
                                onSelect={() => setLocalSettings(prev => ({ ...prev, themeColor: theme.color }))}
                            />
                        ))}
                    </div>
                </Section>
                 <Section title="إعدادات العرض" description="تحكم في العناصر المتحركة والتنبيهات الصوتية.">
                     <div className="space-y-4">
                        <Input icon={<ClockIcon className="w-5 h-5"/>} name="marqueeSpeed" label="سرعة الشريط الإخباري (ثواني)" type="number" value={localSettings.marqueeSpeed.toString()} onChange={handleNumberChange} />
                        <Input icon={<MegaphoneIcon className="w-5 h-5"/>} name="callDuration" label="مدة عرض النداء (ثواني)" type="number" value={localSettings.callDuration?.toString() || '10'} onChange={handleNumberChange} />
                        <ToggleSwitch name="callSoundEnabled" label="تفعيل صوت النداء" checked={localSettings.callSoundEnabled} onChange={handleChange} description="تشغيل صوت عند إضافة مراجع أو النداء عليه." />
                    </div>
                </Section>
              </>
          )}
          {activeTab === 'fields' && (
            <Section title="حقول استمارة المراجع" description="اختر الحقول التي تظهر في استمارة إضافة مراجع جديد.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormFieldPreview icon={<CakeIcon className="w-5 h-5"/>} name="showAgeField" label="حقل العمر" checked={localSettings.showAgeField} onChange={handleChange} />
                    <FormFieldPreview icon={<PhoneIcon className="w-5 h-5"/>} name="showPhoneField" label="حقل الهاتف" checked={localSettings.showPhoneField} onChange={handleChange} />
                    <FormFieldPreview icon={<PencilSquareIcon className="w-5 h-5"/>} name="showReasonField" label="حقل سبب الزيارة" checked={localSettings.showReasonField} onChange={handleChange} />
                    <FormFieldPreview icon={<CurrencyDollarIcon className="w-5 h-5"/>} name="showAmountPaidField" label="حقل الدفعة الأولية" checked={localSettings.showAmountPaidField} onChange={handleChange} />
                </div>
            </Section>
          )}
          {activeTab === 'services' && (
            <Section title="الخدمات والأسعار" description="إدارة قائمة الخدمات والأسعار التي تقدمها العيادة.">
                <div className="flex justify-end items-center mb-4">
                    <button onClick={addService} className="flex items-center gap-1.5 bg-[var(--theme-color)] text-white text-sm font-bold py-2 px-4 rounded-lg hover:opacity-90 transition shadow-sm"><PlusIcon className="w-4 h-4" /> إضافة خدمة</button>
                </div>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2 -mr-2">
                    {localSettings.services.map((service) => (
                        <div key={service.id} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200/80">
                            <input type="text" value={service.name} onChange={e => handleServiceChange(service.id, 'name', e.target.value)} placeholder="اسم الخدمة" className="form-input flex-grow" />
                            <input type="number" value={service.price} onChange={e => handleServiceChange(service.id, 'price', parseInt(e.target.value, 10) || 0)} placeholder="السعر" className="form-input w-36 text-left" />
                            <button onClick={() => removeService(service.id)} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    ))}
                    {localSettings.services.length === 0 && (
                         <div className="text-center text-gray-500 py-10 border-2 border-dashed border-gray-200 rounded-lg">
                            <p className="font-semibold">لا توجد خدمات معرفة.</p>
                            <p className="text-sm">اضغط على "إضافة خدمة" للبدء.</p>
                         </div>
                    )}
                </div>
            </Section>
          )}
          {activeTab === 'security' && (
            <Section title="الأمان وكلمات المرور" description="تغيير كلمات المرور الافتراضية لزيادة أمان النظام.">
                <div className="space-y-6">
                    <PasswordInput 
                        icon={<LockClosedIcon className="w-5 h-5"/>}
                        name="doctorPassword" 
                        label="كلمة مرور الطبيب" 
                        value={localSettings.doctorPassword || ''}
                        onChange={handleChange}
                        showPassword={showDoctorPass}
                        toggleShowPassword={() => setShowDoctorPass(p => !p)}
                        helperText="اترك الحقل فارغاً لاستخدام كلمة المرور الافتراضية (doctor123)."
                    />
                     <PasswordInput 
                        icon={<LockClosedIcon className="w-5 h-5"/>}
                        name="secretaryPassword" 
                        label="كلمة مرور السكرتير" 
                        value={localSettings.secretaryPassword || ''}
                        onChange={handleChange}
                        showPassword={showSecretaryPass}
                        toggleShowPassword={() => setShowSecretaryPass(p => !p)}
                        helperText="اترك الحقل فارغاً لاستخدام كلمة المرور الافتراضية (sec123)."
                    />
                </div>
            </Section>
          )}
        </div>
      );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-gray-200 to-gray-100 p-1 rounded-3xl shadow-2xl w-full max-w-5xl h-full max-h-[720px]">
        <div className="bg-white rounded-2xl w-full h-full flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0 bg-gray-100 p-4 border-b md:border-b-0 md:border-l border-gray-200">
              <header className="flex justify-between items-center p-2 mb-6">
                  <h2 className="text-lg font-bold text-gray-800">الإعدادات</h2>
                  <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 md:hidden">
                      <XMarkIcon className="w-6 h-6 text-gray-600" />
                  </button>
              </header>
              <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible">
                  <SideTab id="general" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Cog8ToothIcon className="w-5 h-5"/>} label="عام" />
                  <SideTab id="services" activeTab={activeTab} setActiveTab={setActiveTab} icon={<CurrencyDollarIcon className="w-5 h-5"/>} label="الخدمات" />
                  <SideTab id="appearance" activeTab={activeTab} setActiveTab={setActiveTab} icon={<PaintBrushIcon className="w-5 h-5"/>} label="المظهر" />
                  <SideTab id="fields" activeTab={activeTab} setActiveTab={setActiveTab} icon={<ClipboardDocumentListIcon className="w-5 h-5"/>} label="الحقول" />
                  <SideTab id="security" activeTab={activeTab} setActiveTab={setActiveTab} icon={<LockClosedIcon className="w-5 h-5"/>} label="الأمان" />
              </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 flex flex-col min-h-0">
            <div className="flex-grow p-6 md:p-8 overflow-y-auto">
              {renderTabContent()}
            </div>
            <footer className="p-4 border-t bg-gray-50/70 flex justify-between items-center">
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 hidden md:block">
                  <XMarkIcon className="w-6 h-6 text-gray-600" />
              </button>
              <div className="flex justify-end gap-3 w-full">
                  <button type="button" onClick={onClose} className="bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm">
                      إلغاء
                  </button>
                  <button onClick={handleSave} disabled={isSaving} className="bg-[var(--theme-color)] hover:opacity-90 text-white font-bold py-2.5 px-6 rounded-lg transition-colors disabled:bg-gray-400 flex items-center gap-2 shadow-sm">
                      {isSaving && <SpinnerIcon className="w-5 h-5" />}
                      {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                  </button>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
};

const Section: FC<{title: string, description: string, children: React.ReactNode}> = ({title, description, children}) => (
    <div className="mb-10">
        <div>
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
        <div className="mt-4 p-5 bg-gray-50 rounded-xl border border-gray-200/80">
            {children}
        </div>
    </div>
);


const SideTab: FC<{id: string, activeTab: string, setActiveTab: (id: string) => void, icon: React.ReactNode, label: string}> = ({id, activeTab, setActiveTab, icon, label}) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`w-full flex-shrink-0 flex items-center gap-3 text-right px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === id
            ? 'bg-[var(--theme-color)] text-white shadow'
            : 'text-gray-500 hover:bg-gray-200 hover:text-gray-800'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const Input: FC<React.InputHTMLAttributes<HTMLInputElement> & {label: string, icon?: React.ReactNode}> = ({label, name, icon, ...props}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                {icon}
            </div>
            <input id={name} name={name} {...props} className="form-input !pr-10" />
        </div>
    </div>
);

const PasswordInput: FC<React.InputHTMLAttributes<HTMLInputElement> & {label: string, icon?: React.ReactNode, showPassword?: boolean, toggleShowPassword?: () => void, helperText?: string}> = ({label, name, icon, showPassword, toggleShowPassword, helperText, ...props}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        <div className="relative">
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                {icon}
            </div>
            <input id={name} name={name} {...props} type={showPassword ? 'text' : 'password'} className="form-input !pl-10 !pr-10" />
            <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute inset-y-0 left-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            >
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
        </div>
        {helperText && <p className="mt-1.5 text-xs text-gray-500">{helperText}</p>}
    </div>
);

const TextArea: FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & {label: string, icon?: React.ReactNode}> = ({label, name, icon, ...props}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        <div className="relative">
            <div className="pointer-events-none absolute top-3 right-0 flex items-center pr-3 text-gray-400">
                {icon}
            </div>
            <textarea id={name} name={name} rows={4} {...props} className="form-input !pr-10" />
        </div>
    </div>
);

const ToggleSwitch: FC<React.InputHTMLAttributes<HTMLInputElement> & {label: string, description?: string}> = ({label, name, description, ...props}) => (
    <label htmlFor={name} className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-gray-200/50 transition-colors -m-3">
        <div>
            <span className="font-medium text-gray-800">{label}</span>
            {description && <p className="text-xs text-gray-500">{description}</p>}
        </div>
        <div className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id={name} name={name} {...props} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-offset-1 peer-focus:ring-[var(--theme-color)] peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] rtl:after:right-[1px] rtl:after:left-auto after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--theme-color)]"></div>
        </div>
    </label>
);

const FormFieldPreview: FC<{
  label: string;
  icon: React.ReactNode;
  name: keyof ClinicSettings;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, icon, name, checked, onChange }) => (
  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="text-gray-400">{icon}</div>
      <span className="font-semibold text-gray-800">{label}</span>
    </div>
    <label htmlFor={name.toString()} className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" id={name.toString()} name={name.toString()} checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-offset-1 peer-focus:ring-[var(--theme-color)] peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] rtl:after:right-[1px] rtl:after:left-auto after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--theme-color)]"></div>
    </label>
  </div>
);


export default SettingsModal;