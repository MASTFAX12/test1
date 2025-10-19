import React, { FC, useState, useMemo } from 'react';
import { Role } from '../types.ts';
import { 
    XMarkIcon, 
    ChevronLeftIcon, 
    ChevronRightIcon, 
    PlusIcon, 
    BellIcon, 
    PencilIcon, 
    CheckIcon, 
    CurrencyDollarIcon, 
    Cog8ToothIcon,
    ArrowUturnLeftIcon
} from './Icons.tsx';

// --- VISUAL ILLUSTRATIONS FOR EACH STEP ---

const S1_Visual: FC = () => (
    <div className="w-full h-full bg-slate-100 p-4 rounded-lg flex items-center justify-center">
        <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
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
        </div>
    </div>
);

const S2_Visual: FC = () => (
    <div className="w-full h-full bg-slate-100 p-4 rounded-lg flex items-center justify-center">
        <div className="bg-white p-3 rounded-lg shadow-lg relative w-48">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">1</div>
                <div className="w-24 h-4 bg-slate-200 rounded-sm"></div>
            </div>
            <div className="absolute -bottom-4 -left-4 flex items-center gap-1 bg-white p-1 rounded-md border shadow-md">
                <BellIcon className="w-6 h-6 p-1 text-slate-500 bg-slate-100 rounded"/>
                <PencilIcon className="w-6 h-6 p-1 text-slate-500 bg-slate-100 rounded"/>
            </div>
            <svg width="40" height="40" viewBox="0 0 40 40" className="absolute -right-10 top-2 text-slate-400">
                 <path d="M5 5 C 35 5, 5 35, 35 35" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="3 3"/>
                 <path d="M30 30 L35 35 L30 40" fill="none" stroke="currentColor" strokeWidth="2"/>
            </svg>
        </div>
    </div>
);

const S3_Visual: FC = () => (
    <div className="w-full h-full bg-slate-100 p-4 rounded-lg flex items-center justify-center gap-4 text-xs font-bold text-slate-500">
        <div className="w-32 text-center">
            <p className="mb-2">الانتظار</p>
            <div className="bg-white p-2 rounded-lg shadow-md border-2 border-dashed border-slate-300 h-24 relative flex items-center justify-center">
                <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow">
                    <CheckIcon className="w-4 h-4 text-white"/>
                </div>
            </div>
        </div>
        <svg width="40" height="20" viewBox="0 0 40 20" className="text-slate-400 -mt-6">
            <path d="M0 10 L30 10" stroke="currentColor" strokeWidth="2"/>
            <path d="M25 5 L35 10 L25 15" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
        <div className="w-32 text-center">
            <p className="mb-2">قيد المعالجة</p>
            <div className="bg-white p-2 rounded-lg shadow-md border-2 border-slate-300 h-24 flex items-center justify-center">
                <p>المراجع جاهز</p>
            </div>
        </div>
    </div>
);

const S4_Visual: FC = () => (
    <div className="w-full h-full bg-slate-100 p-4 rounded-lg flex items-center justify-center gap-4 text-xs font-bold text-slate-500">
        <div className="w-32 text-center">
            <p className="mb-2">من الطبيب</p>
            <div className="bg-white p-2 rounded-lg shadow-md border-2 border-slate-300 h-24 flex items-center justify-center">
                <p>تم الفحص</p>
            </div>
        </div>
         <svg width="40" height="20" viewBox="0 0 40 20" className="text-slate-400 -mt-6">
            <path d="M0 10 L30 10" stroke="currentColor" strokeWidth="2"/>
            <path d="M25 5 L35 10 L25 15" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
        <div className="w-32 text-center">
            <p className="mb-2">بانتظار الدفع</p>
            <div className="bg-white p-2 rounded-lg shadow-md border-2 border-dashed border-slate-300 h-24 relative flex items-center justify-center">
                 <p>جاهز للدفع</p>
                 <div className="absolute -bottom-3 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow">
                    <CurrencyDollarIcon className="w-5 h-5 text-white"/>
                </div>
            </div>
        </div>
    </div>
);

const D1_Visual: FC = () => (
    <div className="w-full h-full bg-slate-100 p-4 rounded-lg flex items-center justify-center text-xs font-bold text-slate-500">
        <div className="w-32 text-center">
            <p className="mb-2">قيد المعالجة</p>
            <div className="bg-white p-2 rounded-lg shadow-md border-2 border-blue-400 h-24 flex items-center justify-center">
                <p>المراجع الحالي</p>
            </div>
        </div>
    </div>
);

const D2_Visual: FC = () => (
    <div className="w-full h-full bg-slate-100 p-4 rounded-lg flex items-center justify-center gap-4 text-xs font-bold text-slate-500">
        <div className="w-32 text-center">
            <p className="mb-2">قيد المعالجة</p>
            <div className="bg-white p-2 rounded-lg shadow-md border-2 border-dashed border-slate-300 h-24 relative flex items-center justify-center">
                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow">
                    <Cog8ToothIcon className="w-4 h-4 text-white"/>
                </div>
            </div>
        </div>
        <svg width="40" height="20" viewBox="0 0 40 20" className="text-slate-400 -mt-6">
            <path d="M0 10 L30 10" stroke="currentColor" strokeWidth="2"/>
            <path d="M25 5 L35 10 L25 15" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
        <div className="w-32 text-center">
            <p className="mb-2">بانتظار الدفع</p>
            <div className="bg-white p-2 rounded-lg shadow-md border-2 border-slate-300 h-24 flex items-center justify-center">
                <p>تم إرساله للسكرتير</p>
            </div>
        </div>
    </div>
);

const D3_Visual: FC = () => (
    <div className="w-full h-full bg-slate-100 p-4 rounded-lg flex flex-col items-center justify-center text-xs font-bold text-slate-500">
        <div className="bg-white p-2 rounded-lg shadow-md border-2 border-dashed border-slate-300 h-16 w-32 mb-2 flex items-center justify-center relative">
            <p>قيد المعالجة</p>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow">
                <CheckIcon className="w-4 h-4 text-white"/>
            </div>
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow">
                <ArrowUturnLeftIcon className="w-4 h-4 text-white"/>
            </div>
        </div>
        <div className="flex items-center w-full justify-between px-4">
             <svg width="40" height="40" viewBox="0 0 40 40" className="text-slate-400 rotate-45">
                <path d="M20 0 L20 30" stroke="currentColor" strokeWidth="2"/>
                <path d="M15 25 L20 35 L25 25" fill="none" stroke="currentColor" strokeWidth="2"/>
            </svg>
             <svg width="40" height="40" viewBox="0 0 40 40" className="text-slate-400 -rotate-45">
                <path d="M20 0 L20 30" stroke="currentColor" strokeWidth="2"/>
                <path d="M15 25 L20 35 L25 25" fill="none" stroke="currentColor" strokeWidth="2"/>
            </svg>
        </div>
        <div className="flex w-full justify-between">
            <div className="w-32 text-center">
                <p className="mb-2">مكتمل</p>
                <div className="bg-white p-2 rounded-lg shadow-sm border h-10"></div>
            </div>
            <div className="w-32 text-center">
                <p className="mb-2">الانتظار</p>
                <div className="bg-white p-2 rounded-lg shadow-sm border h-10"></div>
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
        title: "الخطوة 1: تسجيل المراجع", 
        description: "استخدم زر الإضافة الأزرق (+) لتسجيل مراجع جديد. سيظهر فوراً في قائمة 'الانتظار'، ليصبح مرئياً لك وللطبيب.",
        visual: S1_Visual
    },
    { 
        title: "الخطوة 2: إدارة قائمة الانتظار", 
        description: "غيّر أولوية المراجعين بسهولة عبر السحب والإفلات. استخدم أيقونة الجرس (🔔) للنداء، وأيقونة القلم (✏️) للتعديل.",
        visual: S2_Visual
    },
    { 
        title: "الخطوة 3: إرسال المراجع للفحص", 
        description: "عندما يحين دور المراجع، اضغط على أيقونة الصح (✔). هذا الإجراء ينقله إلى 'قيد المعالجة'، وهو إشعارك للطبيب بأنه جاهز.",
        visual: S3_Visual
    },
    { 
        title: "الخطوة 4: تحصيل الرسوم", 
        description: "بعد انتهاء الطبيب، ستستلم المراجع تلقائياً في قائمة 'بانتظار الدفع'. اضغط على أيقونة الدولار (💲) لتسجيل المبلغ المدفوع.",
        visual: S4_Visual
    },
];

const doctorSteps: HelpStep[] = [
    {
        title: "الخطوة 1: بدء الفحص",
        description: "السكرتير سيجهز المراجعين ويرسلهم إلى قائمة 'قيد المعالجة'، وهي قائمة عملك الرئيسية. يمكنك أيضاً إدخال مراجع بنفسك.",
        visual: D1_Visual
    },
    {
        title: "الخطوة 2: إنهاء وتحديد الرسوم",
        description: "بعد الفحص، اضغط على أيقونة الترس (⚙️) في بطاقة المراجع. حدد الخدمات والرسوم ثم قم بالتأكيد لإرسال المراجع للسكرتير.",
        visual: D2_Visual
    },
    {
        title: "حالات خاصة",
        description: "لزيارة بدون رسوم، اضغط (✔) مرة أخرى لإرسال المراجع للأرشيف. لإعادته للانتظار، استخدم أيقونة الإرجاع (↩️).",
        visual: D3_Visual
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