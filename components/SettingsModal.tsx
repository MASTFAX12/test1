import React, { useState, useEffect, FC } from 'react';
import type { ClinicSettings, PublicTheme } from '../types.ts';
import { themes } from '../types.ts';
import {
  XMarkIcon,
  TrashIcon,
  SpinnerIcon,
  Cog8ToothIcon,
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
  ArchiveBoxIcon,
  ArrowPathIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  ConfirmationDialog,
} from './Icons.tsx';
import { updateClinicSettings, archiveAllChatMessages, clearActiveQueue } from '../services/firebase.ts';
import { toast } from 'react-hot-toast';
import { DEFAULT_SETTINGS } from '../constants.ts';

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

const AccentThemeCard: FC<{ theme: typeof themeCards[0]; isSelected: boolean; onSelect: () => void; }> = ({ theme, isSelected, onSelect }) => (
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

const PublicThemeCard: FC<{ theme: PublicTheme; isSelected: boolean; onSelect: () => void; }> = ({ theme, isSelected, onSelect }) => (
    <button
        type="button"
        onClick={onSelect}
        className={`w-full rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ring-[var(--theme-color)] overflow-hidden shadow-sm group ${isSelected ? 'border-[var(--theme-color)] shadow-lg scale-105' : 'border-gray-200 hover:border-gray-300 hover:scale-105'}`}
    >
        <div className={`w-full h-24 rounded-t-lg p-2 flex gap-2 ${theme.background}`}>
            {/* Mock Current Patient Card */}
            <div className={`w-2/3 h-full rounded-md ${theme.cardBackground} border ${theme.cardBorder} p-1.5 flex flex-col justify-between`}>
                <div className={`h-1.5 w-3/4 rounded-sm ${theme.primaryText.includes('white') ? 'bg-white/60' : 'bg-gray-600/60'}`}></div>
                <div className={`h-3 w-1/2 rounded ${theme.primaryText.includes('white') ? 'bg-white/90' : 'bg-gray-800/90'}`}></div>
            </div>
            {/* Mock Waiting List */}
            <div className="w-1/3 h-full flex flex-col gap-1">
                <div className={`h-full w-full rounded-sm ${theme.listItemDefaultBackground}`}></div>
                <div className={`h-full w-full rounded-sm ${theme.listItemDefaultBackground}`}></div>
                <div className={`h-full w-full rounded-sm ${theme.listItemDefaultBackground}`}></div>
            </div>
        </div>
        <div className="p-3 text-center bg-white rounded-b-lg">
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
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearQueueConfirm, setShowClearQueueConfirm] = useState(false);
  const [isClearingQueue, setIsClearingQueue] = useState(false);
  const [showArchiveChatConfirm, setShowArchiveChatConfirm] = useState(false);
  const [isArchivingChat, setIsArchivingChat] = useState(false);


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
  
  const handleResetToDefaults = () => {
    setLocalSettings(DEFAULT_SETTINGS);
    setShowResetConfirm(false);
    toast.info('تم استعادة الإعدادات الافتراضية. اضغط "حفظ" لتأكيد التغييرات.');
  };
  
  const handleClearQueue = async () => {
    setShowClearQueueConfirm(false);
    setIsClearingQueue(true);
    const toastId = toast.loading("جاري تنظيف الطابور...");
    try {
        const count = await clearActiveQueue();
        toast.success(count > 0 ? `تم إلغاء ${count} مراجع.` : `الطابور النشط فارغ بالفعل.`, { id: toastId });
    } catch(e) {
        toast.error("فشلت عملية تنظيف الطابور.", { id: toastId });
        console.error(e);
    } finally {
        setIsClearingQueue(false);
    }
  };
  
  const handleArchiveChat = async () => {
    setShowArchiveChatConfirm(false);
    setIsArchivingChat(true);
    const toastId = toast.loading("جاري أرشفة الدردشة...");
    try {
        const count = await archiveAllChatMessages();
        toast.success(count > 0 ? `تمت أرشفة ${count} رسالة.` : 'لا توجد رسائل للأرشفة.', { id: toastId });
    } catch(e) {
        toast.error("فشلت عملية أرشفة الدردشة.", { id: toastId });
        console.error(e);
    } finally {
        setIsArchivingChat(false);
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
                </div>
              </Section>
            )}
            {activeTab === 'appearance' && (
              <>
                <Section title="ثيم الشاشة الرئيسية" description="اختر المظهر العام لشاشة عرض المرضى.">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {themes.map(theme => (
                            <PublicThemeCard
                                key={theme.id}
                                theme={theme}
                                isSelected={localSettings.publicTheme === theme.id}
                                onSelect={() => setLocalSettings(prev => ({ ...prev, publicTheme: theme.id }))}
                            />
                        ))}
                    </div>
                </Section>
                <Section title="لون التمييز (Accent)" description="اختر اللون المستخدم للأزرار والعناصر المميزة في كل التطبيق.">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {themeCards.map(theme => (
                            <AccentThemeCard
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
                </div>
            </Section>
          )}
          {activeTab === 'workflow' && (
            <Section title="أتمتة سير العمل" description="تحسين كفاءة العيادة عبر أتمتة الإجراءات المتكررة.">
              <div className="space-y-4">
                <ToggleSwitch
                  name="autoInProgressOnCall"
                  label="نقل تلقائي إلى 'قيد المعالجة' عند النداء"
                  checked={localSettings.autoInProgressOnCall}
                  onChange={handleChange}
                  description="عند الضغط على زر النداء، يتم تغيير حالة المراجع مباشرة إلى 'قيد المعالجة'."
                />
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
           {activeTab === 'advanced' && (
              <>
                <div className="p-4 rounded-xl border-2 border-red-300 bg-red-50">
                    <div className="flex items-center gap-3 mb-2">
                        <ExclamationTriangleIcon className="w-6 h-6 text-red-500"/>
                        <h4 className="text-lg font-bold text-red-800">منطقة الخطر</h4>
                    </div>
                    <p className="text-sm text-red-700 mb-4">الإجراءات التالية لا يمكن التراجع عنها. الرجاء المتابعة بحذر.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                       <DangerButton label="أرشفة كل الدردشة" onClick={() => setShowArchiveChatConfirm(true)} disabled={isArchivingChat} />
                       <DangerButton label="تنظيف الطابور الحالي" onClick={() => setShowClearQueueConfirm(true)} disabled={isClearingQueue} />
                       <DangerButton label="إعادة ضبط الإعدادات" onClick={() => setShowResetConfirm(true)} />
                    </div>
                </div>
              </>
           )}
        </div>
      );
  }

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-gradient-to-br from-gray-200 to-gray-100 p-1 rounded-3xl shadow-2xl w-full max-w-5xl h-full max-h-[720px]">
          <div className="bg-white rounded-2xl w-full h-full flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar */}
            <aside className="w-full md:w-64 flex-shrink-0 bg-gray-100 p-4 border-b md:border-b-0 md:border-l border-gray-200">
                <header className="flex justify-between items-center p-2 mb-6">
                    <h2 className="text-lg font-bold text-[var(--theme-color)]">الإعدادات</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 md:hidden">
                        <XMarkIcon className="w-6 h-6 text-gray-600" />
                    </button>
                </header>
                <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible">
                    <SideTab id="general" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Cog8ToothIcon className="w-5 h-5"/>} label="عام" />
                    <SideTab id="appearance" activeTab={activeTab} setActiveTab={setActiveTab} icon={<PaintBrushIcon className="w-5 h-5"/>} label="المظهر" />
                    <SideTab id="fields" activeTab={activeTab} setActiveTab={setActiveTab} icon={<ClipboardDocumentListIcon className="w-5 h-5"/>} label="الحقول" />
                    <SideTab id="workflow" activeTab={activeTab} setActiveTab={setActiveTab} icon={<ArrowPathIcon className="w-5 h-5"/>} label="سير العمل" />
                    <SideTab id="security" activeTab={activeTab} setActiveTab={setActiveTab} icon={<LockClosedIcon className="w-5 h-5"/>} label="الأمان" />
                    <SideTab id="advanced" activeTab={activeTab} setActiveTab={setActiveTab} icon={<WrenchScrewdriverIcon className="w-5 h-5"/>} label="متقدم" />
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-0">
              <div className="flex-grow p-6 md:p-8 overflow-y-auto">
                {renderTabContent()}
              </div>
              <footer className="p-4 border-t bg-gray-50/70 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 hidden md:block">
                        <XMarkIcon className="w-6 h-6 text-gray-600" />
                    </button>
                </div>
                <div className="flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm">
                        إلغاء
                    </button>
                    <button onClick={handleSave} disabled={isSaving} className="bg-[var(--theme-color)] hover:opacity-90 text-white font-bold py-2.5 px-6 rounded-lg transition-colors disabled:bg-gray-400 flex items-center gap-2 shadow-sm">
                      {isSaving && <SpinnerIcon className="w-5 h-5" />}
                      {isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                    </button>
                </div>
              </footer>
            </main>
          </div>
        </div>
      </div>
      <ConfirmationDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetToDefaults}
        title="إعادة ضبط الإعدادات"
        message="هل أنت متأكد من رغبتك في استعادة جميع الإعدادات إلى الوضع الافتراضي؟ لن يتم حفظ هذا الإجراء حتى تضغط على 'حفظ الإعدادات'."
        confirmButtonText="نعم، إعادة الضبط"
        confirmButtonColor="bg-red-600 hover:bg-red-700"
        icon={<ArrowPathIcon className="w-5 h-5" />}
      />
      <ConfirmationDialog
        isOpen={showClearQueueConfirm}
        onClose={() => setShowClearQueueConfirm(false)}
        onConfirm={handleClearQueue}
        title="تنظيف الطابور الحالي"
        message="سيؤدي هذا إلى إلغاء جميع المراجعين في قوائم 'الانتظار' و 'قيد المعالجة' و 'بانتظار الفحص'. لا يمكن التراجع عن هذا الإجراء."
        confirmButtonText="نعم، تنظيف الطابور"
        confirmButtonColor="bg-red-600 hover:bg-red-700"
        icon={<TrashIcon className="w-5 h-5" />}
      />
      <ConfirmationDialog
        isOpen={showArchiveChatConfirm}
        onClose={() => setShowArchiveChatConfirm(false)}
        onConfirm={handleArchiveChat}
        title="أرشفة جميع الرسائل"
        message="سيؤدي هذا إلى نقل جميع الرسائل في الدردشة الحالية إلى الأرشيف بشكل دائم. لا يمكن التراجع عن هذا الإجراء."
        confirmButtonText="نعم، أرشفة الكل"
        confirmButtonColor="bg-yellow-500 hover:bg-yellow-600"
        icon={<ArchiveBoxIcon className="w-5 h-5" />}
      />
    </>
  );
};

interface SectionProps {
    title: string;
    description: string;
    children: React.ReactNode;
}
const Section: FC<SectionProps> = ({ title, description, children }) => (
    <div className="mb-8">
        <h3 className="text-xl font-bold text-[var(--theme-color)]">{title}</h3>
        <p className="text-sm text-gray-500 mb-4">{description}</p>
        <div className="p-6 bg-gray-50/80 rounded-xl border border-gray-200/80">
            {children}
        </div>
    </div>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon: React.ReactNode;
}
const Input: FC<InputProps> = ({ label, icon, name, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400">
                {icon}
            </div>
            <input name={name} id={name} {...props} className="form-input !pr-10" />
        </div>
    </div>
);

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    icon: React.ReactNode;
}
const TextArea: FC<TextAreaProps> = ({ label, icon, name, ...props }) => (
     <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        <div className="relative">
            <div className="pointer-events-none absolute top-3.5 right-0 flex items-center pr-3.5 text-gray-400">
                {icon}
            </div>
            <textarea name={name} id={name} {...props} rows={3} className="form-input !pr-10" />
        </div>
    </div>
);

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon: React.ReactNode;
    showPassword;
    toggleShowPassword;
    helperText?: string;
}
const PasswordInput: FC<PasswordInputProps> = ({ label, icon, name, showPassword, toggleShowPassword, helperText, ...props}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400">
                {icon}
            </div>
            <input name={name} id={name} type={showPassword ? 'text' : 'password'} {...props} className="form-input !pr-10 !pl-10" />
            <button type="button" onClick={toggleShowPassword} className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeSlashIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5" />}
            </button>
        </div>
        {helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
    </div>
);


interface ToggleSwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    description?: string;
}
const ToggleSwitch: FC<ToggleSwitchProps> = ({ name, label, description, checked, onChange }) => (
    <label htmlFor={name} className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200/80 cursor-pointer hover:bg-gray-200/20 transition-colors">
      <div>
        <span className="font-medium text-gray-700 text-sm">{label}</span>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
      <div className="relative inline-flex items-center cursor-pointer">
          <input
              id={name}
              name={name}
              type="checkbox"
              checked={checked}
              onChange={onChange}
              className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-offset-1 peer-focus:ring-[var(--theme-color)] peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] rtl:after:right-[1px] rtl:after:left-auto after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--theme-color)]"></div>
      </div>
    </label>
);

const FormFieldPreview: FC<ToggleSwitchProps & { icon: React.ReactNode }> = ({ icon, name, label, checked, onChange }) => (
    <label htmlFor={name} className="bg-white p-3 rounded-lg border border-gray-200/80 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
            {icon}
            <span className="font-semibold text-sm text-gray-700">{label}</span>
        </div>
        <div className="relative inline-flex items-center">
            <input
                id={name}
                name={name}
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-offset-1 peer-focus:ring-[var(--theme-color)] peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] rtl:after:right-[2px] rtl:after:left-auto after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--theme-color)]"></div>
        </div>
    </label>
);

interface SideTabProps {
    id: string;
    activeTab: string;
    setActiveTab: (id: string) => void;
    icon: React.ReactNode;
    label: string;
}
const SideTab: FC<SideTabProps> = ({ id, activeTab, setActiveTab, icon, label }) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`w-full flex items-center gap-3 text-right px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
            activeTab === id
            ? 'bg-[var(--theme-color)] text-white shadow'
            : 'text-gray-600 hover:bg-gray-200/60 hover:text-gray-900'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const DangerButton: FC<{ label: string; onClick: () => void; disabled?: boolean; }> = ({ label, onClick, disabled }) => (
    <button 
        type="button" 
        onClick={onClick}
        disabled={disabled}
        className="w-full text-center text-sm font-bold text-red-700 bg-red-100/70 hover:bg-red-200/70 p-3 rounded-lg transition-colors border border-red-200/80 disabled:opacity-60 disabled:cursor-not-allowed"
    >
        {label}
    </button>
);

export default SettingsModal;