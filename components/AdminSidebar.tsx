
import React, { useState } from 'react';
import { PlusIcon, ChartBarIcon, ChatBubbleOvalLeftEllipsisIcon, SpinnerIcon } from './Icons.tsx';
import StatsPanel from './StatsPanel.tsx';
import ChatPanel from './ChatPanel.tsx';
import { Role } from '../types.ts';
import type { ClinicSettings, PatientVisit } from '../types.ts';
import { addPatientVisit } from '../services/firebase.ts';
import { toast } from 'react-hot-toast';

interface AdminSidebarProps {
  settings: ClinicSettings;
  patients: PatientVisit[];
  role: Role;
}

type ActiveTab = 'add' | 'stats' | 'chat';

const AddPatientPanel: React.FC<{ settings: ClinicSettings }> = ({ settings }) => {
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
      // Reset form
      setName('');
      setPhone('');
      setReason('');
      setAge('');
      setAmountPaid('');
      setShowDetailsToPublic(false);
    } catch (error) {
      console.error("Failed to add patient:", error);
      toast.error('حدث خطأ أثناء إضافة المراجع.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formInputClasses = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";

  return (
    <div className="animate-fade-in">
      <h3 className="text-lg font-bold text-gray-800 mb-4">إضافة مراجع جديد</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">الاسم الكامل *</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={formInputClasses}
            required
            autoFocus
          />
        </div>
        
        {settings.showAgeField && (
            <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700">العمر</label>
                <input type="text" inputMode="numeric" id="age" value={age} onChange={(e) => { if (/^\d*$/.test(e.target.value)) setAge(e.target.value); }} className={formInputClasses}/>
            </div>
        )}

        {settings.showPhoneField && (
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">رقم الهاتف</label>
                <input type="tel" id="phone" value={phone} onChange={(e) => { if (/^[0-9\s+()-]*$/.test(e.target.value)) setPhone(e.target.value); }} className={formInputClasses}/>
            </div>
        )}
        
        {settings.showReasonField && (
            <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700">سبب الزيارة</label>
                <input type="text" id="reason" value={reason} onChange={(e) => setReason(e.target.value)} className={formInputClasses}/>
            </div>
        )}
        
        {settings.showAmountPaidField && (
             <div>
                <label htmlFor="amountPaid" className="block text-sm font-medium text-gray-700">الدفعة الأولية</label>
                <input type="text" inputMode="decimal" id="amountPaid" step="any" value={amountPaid} onChange={(e) => { if (/^\d*\.?\d*$/.test(e.target.value)) setAmountPaid(e.target.value); }} className={formInputClasses}/>
            </div>
        )}
        
        <div className="flex items-start">
            <div className="flex items-center h-5">
                <input id="showDetailsToPublic" name="showDetailsToPublic" type="checkbox" checked={showDetailsToPublic} onChange={(e) => setShowDetailsToPublic(e.target.checked)} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"/>
            </div>
            <div className="mr-3 text-sm">
                <label htmlFor="showDetailsToPublic" className="font-medium text-gray-700 cursor-pointer">إظهار التفاصيل للعامة</label>
                <p className="text-xs text-gray-500">سيتم إظهار سبب الزيارة على الشاشة العامة.</p>
            </div>
        </div>
        
        <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400">
          {isSubmitting && <SpinnerIcon className="w-4 h-4" />}
          {isSubmitting ? 'جاري الإضافة...' : 'إضافة إلى القائمة'}
        </button>
      </form>
    </div>
  );
};


const AdminSidebar: React.FC<AdminSidebarProps> = ({ settings, patients, role }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('add');
  
  const isSecretary = role === Role.Secretary;

  return (
    <aside className="lg:w-96 flex-shrink-0 space-y-6 lg:sticky top-28 self-start">
      <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <nav className="flex">
          {isSecretary && (
            <TabButton 
              label="إضافة" 
              icon={<PlusIcon className="w-5 h-5" />} 
              isActive={activeTab === 'add'} 
              onClick={() => setActiveTab('add')}
            />
          )}
          <TabButton 
            label="إحصائيات" 
            icon={<ChartBarIcon className="w-5 h-5" />} 
            isActive={activeTab === 'stats'} 
            onClick={() => setActiveTab('stats')}
          />
          <TabButton 
            label="دردشة" 
            icon={<ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5" />} 
            isActive={activeTab === 'chat'} 
            onClick={() => setActiveTab('chat')}
          />
        </nav>
        <div className="p-4 md:p-6">
          {activeTab === 'add' && isSecretary && <AddPatientPanel settings={settings} />}
          {activeTab === 'stats' && <StatsPanel patients={patients} isEmbedded={true} />}
          {activeTab === 'chat' && <ChatPanel role={role} isEmbedded={true} />}
        </div>
      </div>
    </aside>
  );
};

interface TabButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex flex-col items-center justify-center gap-1 p-3 text-sm font-semibold transition-colors duration-200 border-b-2 ${
      isActive
        ? 'border-blue-500 text-blue-600 bg-blue-50'
        : 'border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);


export default AdminSidebar;
