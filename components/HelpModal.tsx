import React, { FC, useState, useMemo } from 'react';
import { Role } from '../types.ts';
// FIX: Added missing ClockIcon and UserIcon imports.
import { 
    XMarkIcon, 
    ChevronLeftIcon, 
    ChevronRightIcon, 
    PlusIcon, 
    BellIcon, 
    PencilIcon, 
    CheckIcon, 
    CurrencyDollarIcon, 
    ArrowUturnLeftIcon,
    TrashIcon,
    ClipboardDocumentListIcon,
    PaperAirplaneIcon,
    ArchiveBoxIcon,
    MagnifyingGlassIcon,
    ClockIcon,
    UserIcon,
} from './Icons.tsx';
import { WrenchScrewdriverIcon as ExaminationIcon } from './Icons.tsx';

// --- VISUAL ILLUSTRATIONS FOR EACH STEP ---

// SECRETARY VISUALS
const S1_Visual: FC = () => (
    <div className="w-full h-full bg-slate-100 p-4 rounded-lg flex items-center justify-center">
        <div className="w-20 h-20 bg-[var(--theme-color)] rounded-2xl flex items-center justify-center shadow-lg">
            <PlusIcon className="w-10 h-10 text-white"/>
        </div>
        <svg width="60" height="20" viewBox="0 0 60 20" className="mx-2 text-slate-400">
            <path d="M0 10 L50 10" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2"/>
            <path d="M45 5 L55 10 L45 15" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
        <div className="bg-white p-3 rounded-lg shadow-lg">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">1</div>
                <div className="w-24 h-4 bg-slate-200 rounded-sm"></div>
            </div>
             <div className="mt-2 pt-1 border-t border-slate-200 text-blue-600 text-xs font-bold flex items-center gap-1">
                <ClockIcon className="w-3 h-3"/> <span>في الانتظار</span>
            </div>
        </div>
    </div>
);

const New_S2_Visual: FC = () => (
    <div className="w-full h-full bg-slate-100 p-4 rounded-lg flex items-center justify-center">
        <div className="bg-white p-3 rounded-lg shadow-lg relative w-52">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">1</div>
                <div className="w-24 h-4 bg-slate-200 rounded-sm"></div>
            </div>
            <div className="absolute -bottom-4 -left-4 flex items-center gap-1 bg-white p-1 rounded-md border shadow-md">
                <BellIcon className="w-6 h-6 p-1 text-blue-500 bg-blue-50 rounded"/>
                <CheckIcon className="w-6 h-6 p-1 text-red-500 bg-red-50 rounded"/>
                <CurrencyDollarIcon className="w-6 h-6 p-1 text-yellow-500 bg-yellow-50 rounded"/>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute -right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
        </div>
    </div>
);

const S3_Visual: FC = () => (
    <div className="w-full h-full bg-slate-100 p-4 rounded-lg flex items-center justify-center gap-4 text-xs font-bold text-slate-500">
        <div className="w-32 text-center">
            <p className="mb-2">الانتظار</p>
            <div className="bg-white p-2 rounded-lg shadow-md border-2 border-dashed border-slate-300 h-24 relative flex items-center justify-center">
                <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow">
                    <CheckIcon className="w-4 h-4 text-white"/>
                </div>
                 <p>المراجع</p>
            </div>
        </div>
        <svg width="40" height="20" viewBox="0 0 40 20" className="text-slate-400 -mt-6">
            <path d="M0 10 L30 10" stroke="currentColor" strokeWidth="2"/>
            <path d="M25 5 L35 10 L25 15" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
        <div className="w-32 text-center">
            <p className="mb-2">عند الطبيب</p>
            <div className="bg-white p-2 rounded-lg shadow-md border-2 border-slate-300 h-24 flex items-center justify-center">
                <p>تم إرساله للطبيب</p>
            </div>
        </div>
    </div>
);

const New_S4_Visual: FC = () => (
    <div className="w-full h-full bg-slate-100 p-4 rounded-lg flex items-center justify-center gap-4">
        <div className="bg-white p-3 rounded-lg shadow-lg relative w-40 text-center">
            <p className="text-sm font-bold text-slate-600">المراجع</p>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow">
                <TrashIcon className="w-5 h-5 text-white"/>
            </div>
        </div>
        <svg width="40" height="20" viewBox="0 0 40 20" className="text-slate-400">
            <path d="M0 10 L30 10" stroke="currentColor" strokeWidth="2"/>
            <path d="M25 5 L35 10 L25 15" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
        <div className="bg-white p-3 rounded-lg shadow-md border-2 border-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-yellow-700 bg-yellow-100 p-2 rounded">
                <ArchiveBoxIcon className="w-4 h-4"/><span>أرشفة</span>
            </div>
             <div className="flex items-center gap-2 text-sm font-semibold text-red-700 bg-red-100 p-2 rounded">
                <TrashIcon className="w-4 h-4"/><span>حذف نهائي</span>
            </div>
        </div>
    </div>
);

const New_S5_Visual: FC = () => (
    <div className="w-full h-full bg-slate-100 p-4 rounded-lg flex items-center justify-center gap-4">
        <div className="w-24 bg-white p-2 rounded-lg shadow-md space-y-2">
            <div className="h-4 bg-slate-200 rounded"></div>
            <div className="h-4 bg-[var(--theme-color)] rounded text-white text-xs text-center">الأرشيف</div>
            <div className="h-4 bg-slate-200 rounded"></div>
        </div>
         <svg width="40" height="20" viewBox="0 0 40 20" className="text-slate-400">
            <path d="M0 10 L30 10" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3"/>
            <path d="M25 5 L35 10 L25 15" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
        <div className="w-48 bg-white p-2 rounded-lg shadow-md space-y-2 border-t-4 border-[var(--theme-color)]">
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded">
                <MagnifyingGlassIcon className="w-4 h-4 text-slate-400"/>
                <div className="h-2 flex-grow bg-slate-200 rounded"></div>
            </div>
            <div className="h-4 bg-slate-200 rounded"></div>
            <div className="h-4 bg-slate-200 rounded"></div>
        </div>
    </div>
);


// DOCTOR VISUALS
const D1_Visual: FC = () => (
    <div className="w-full h-full bg-slate-100 p-4 rounded-lg flex items-center justify-center text-xs font-bold text-slate-500">
        <div className="w-40 text-center">
            <p className="mb-2">عند الطبيب</p>
            <div className="bg-white p-2 rounded-lg shadow-md border-2 border-red-400 h-24 flex flex-col items-center justify-center">
                <p className="text-base">المراجع الحالي</p>
                 <div className="mt-2 pt-1 border-t w-full border-slate-200 text-red-600 text-xs font-bold flex items-center justify-center gap-1">
                    <UserIcon className="w-3 h-3"/> <span>عند الطبيب</span>
                </div>
            </div>
        </div>
    </div>
);

const New_D2_Visual: FC = () => (
     <div className="w-full h-full bg-slate-100 p-4 rounded-lg flex items-center justify-center gap-4 text-xs font-bold text-slate-500">
        <div className="w-32 text-center">
            <p className="mb-2">عند الطبيب</p>
            <div className="bg-white p-2 rounded-lg shadow-md border-2 border-dashed border-slate-300 h-24 relative flex items-center justify-center">
                 <p>المراجع</p>
                 <div className="absolute -bottom-4 -left-4 flex items-center gap-1 bg-white p-1 rounded-md border shadow-md">
                    <ClipboardDocumentListIcon className="w-6 h-6 p-1 text-slate-500 bg-slate-100 rounded"/>
                    <PaperAirplaneIcon className="w-6 h-6 p-1 text-purple-500 bg-purple-50 rounded"/>
                    <CurrencyDollarIcon className="w-6 h-6 p-1 text-yellow-500 bg-yellow-50 rounded"/>
                </div>
            </div>
        </div>
        <svg width="40" height="20" viewBox="0 0 40 20" className="text-purple-400 -mt-6">
            <path d="M0 10 L30 10" stroke="currentColor" strokeWidth="2"/>
            <path d="M25 5 L35 10 L25 15" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
        <div className="w-32 text-center">
            <p className="mb-2">إجراءات مطلوبة</p>
            <div className="bg-white p-2 rounded-lg shadow-md border-2 border-purple-300 h-24 flex items-center justify-center">
                <p>إما للفحص أو للدفع</p>
            </div>
        </div>
    </div>
);

const New_D3_Visual: FC = () => (
    <div className="w-full h-full bg-slate-100 p-4 rounded-lg flex flex-col items-center justify-center text-xs font-bold text-slate-500">
        <div className="bg-white p-2 rounded-lg shadow-md border-2 border-red-400 h-16 w-32 mb-2 flex items-center justify-center relative">
            <p>عند الطبيب</p>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow">
                <CheckIcon className="w-4 h-4 text-white"/>
            </div>
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow">
                <ArrowUturnLeftIcon className="w-4 h-4 text-white"/>
            </div>
        </div>
        <div className="flex items-center w-full justify-between px-4">
             <svg width="40" height="40" viewBox="0 0 40 40" className="text-green-400 rotate-45">
                <path d="M20 0 L20 30" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3"/>
                <path d="M15 25 L20 35 L25 25" fill="none" stroke="currentColor" strokeWidth="2"/>
            </svg>
             <svg width="40" height="40" viewBox="0 0 40 40" className="text-orange-400 -rotate-45">
                <path d="M20 0 L20 30" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3"/>
                <path d="M15 25 L20 35 L25 25" fill="none" stroke="currentColor" strokeWidth="2"/>
            </svg>
        </div>
        <div className="flex w-full justify-between">
            <div className="w-32 text-center">
                <p className="mb-2">الأرشيف</p>
                <div className="bg-white p-2 rounded-lg shadow-sm border-2 border-green-300 h-10"></div>
            </div>
            <div className="w-32 text-center">
                <p className="mb-2">الانتظار</p>
                <div className="bg-white p-2 rounded-lg shadow-sm border-2 border-orange-300 h-10"></div>
            </div>
        </div>
    </div>
);


interface HelpStep {
  title: string;
  description: React.ReactNode;
  visual: FC;
}

const secretarySteps: HelpStep[] = [
    { 
        title: "الخطوة 1: إضافة مراجع", 
        description: "استخدم زر الإضافة (+) لتسجيل مراجع جديد. سيظهر فوراً في قائمة 'الانتظار' ليصبح مرئياً لك وللطبيب.",
        visual: S1_Visual
    },
    { 
        title: "الخطوة 2: إدارة قائمة الانتظار", 
        description: "عند تمرير الفأرة على البطاقة، ستظهر الأزرار. استخدم الجرس (🔔) للنداء، الدولار (💲) لتسجيل الدفع، والصح (✔) لإدخاله للطبيب. يمكنك أيضاً سحب البطاقة لتغيير ترتيبها.",
        visual: New_S2_Visual
    },
    { 
        title: "الخطوة 3: إرسال المراجع للطبيب", 
        description: "عندما يحين دور المراجع، اضغط على أيقونة الصح (✔). هذا الإجراء ينقله إلى قائمة 'عند الطبيب'، وهو إشعار للطبيب بأن المراجع جاهز في غرفة الفحص.",
        visual: S3_Visual
    },
    { 
        title: "الخطوة 4: التعامل مع الحالات", 
        description: "إذا غادر مراجع قبل الفحص، استخدم أيقونة سلة المهملات (🗑️) لأرشفته أو حذفه نهائياً من قائمة اليوم.",
        visual: New_S4_Visual
    },
    {
        title: "الخطوة 5: الأرشيف الدائم",
        description: "من الشريط الجانبي، ادخل إلى 'أرشيف المراجعين'. هنا يمكنك البحث عن أي مراجع، عرض سجل زياراته، تعديل بياناته الأساسية، أو حذفه بشكل دائم من النظام.",
        visual: New_S5_Visual
    }
];

const doctorSteps: HelpStep[] = [
    {
        title: "الخطوة 1: مساحة عملك",
        description: "المرضى الجاهزون للفحص سيظهرون لك مباشرة في قائمة 'عند الطبيب'. هذه هي قائمة عملك الأساسية.",
        visual: D1_Visual
    },
    {
        title: "الخطوة 2: أثناء الفحص",
        description: "استخدم أيقونة الملاحظات (📋) لتدوين التشخيص. إذا كان المراجع بحاجة لفحوصات، أرسله إلى قائمة 'إجراءات مطلوبة' باستخدام أيقونة الطائرة (✈️). أو أرسله للدفع باستخدام أيقونة الدولار (💲).",
        visual: New_D2_Visual
    },
    {
        title: "الخطوة 3: إنهاء الزيارة",
        description: "عند الانتهاء، اضغط على أيقونة الصح (✔) لنقل الزيارة إلى الأرشيف كـ 'مكتمل'. إذا احتجت لإعادة المراجع إلى قائمة الانتظار لأي سبب، استخدم أيقونة الإرجاع (↩️).",
        visual: New_D3_Visual
    }
];

interface HelpModalProps {
  role: Role;
  onClose: () => void;
}

const HelpModal: FC<HelpModalProps> = ({ role, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const isDoctor = role === Role.Doctor;
  const steps = useMemo(() => isDoctor ? doctorSteps : secretarySteps, [isDoctor]);
  const activeStep = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-full max-h-[550px] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800">دليل الاستخدام التفاعلي</h2>
            <p className="text-sm text-gray-500">{isDoctor ? "سير العمل (الطبيب)" : "سير العمل (السكرتير)"}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </header>

        <main className="flex-grow grid md:grid-cols-2 gap-6 p-6 overflow-hidden">
            <div className="bg-gray-50 rounded-xl border border-gray-200/80 flex items-center justify-center p-4">
               <div key={currentStep} className="w-full h-full animate-fade-in">
                 {activeStep.visual({})}
               </div>
            </div>
            <div className="flex flex-col justify-center text-center md:text-right">
                <h3 className="text-2xl font-bold text-[var(--theme-color)] mb-3">{activeStep.title}</h3>
                <p className="text-gray-600 leading-relaxed">{activeStep.description}</p>
            </div>
        </main>

        <footer className="p-4 border-t bg-gray-50 rounded-b-2xl flex-shrink-0 flex justify-between items-center">
          {/* Progress Dots */}
          <div className="flex items-center gap-2">
             {steps.map((_, index) => (
                <div key={index} className={`w-3 h-3 rounded-full transition-colors ${currentStep === index ? 'bg-[var(--theme-color)]' : 'bg-gray-300'}`}></div>
             ))}
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center gap-2 bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon className="w-5 h-5" />
              <span>السابق</span>
            </button>
            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-[var(--theme-color)] hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-sm"
              >
                <span>التالي</span>
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-sm"
              >
                فهمت، إنهاء
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HelpModal;