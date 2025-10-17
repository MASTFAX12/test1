import React, { FC } from 'react';
import { Role } from '../types.ts';
import { XMarkIcon } from './Icons.tsx';

interface HelpModalProps {
  role: Role;
  onClose: () => void;
}

const InstructionPoint: FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-4">
        <h4 className="font-bold text-blue-700 mb-1">{title}</h4>
        <div className="text-sm text-gray-600 leading-relaxed pr-2 border-r-2 border-blue-200">{children}</div>
    </div>
);

const SecretaryInstructions: FC = () => (
    <>
        <p className="mb-6 text-gray-700">دليلك لإدارة تدفق المرضى بسلاسة والتنسيق الفعال مع الطبيب.</p>
        <InstructionPoint title="الخطوة 1: تسجيل الوصول (بداية الرحلة)">
            استخدم الزر العائم الأزرق (+) لتسجيل مراجع جديد. سيظهر المراجع فوراً في قائمة "الانتظار" ليراه الطبيب أيضاً.
        </InstructionPoint>
        <InstructionPoint title="الخطوة 2: إدارة قائمة الانتظار">
            يمكنك تغيير أولوية المراجعين عبر <strong>السحب والإفلات</strong>. استخدم زر الجرس (🔔) للنداء، أو القلم (✏️) لتعديل البيانات.
        </InstructionPoint>
         <InstructionPoint title="الخطوة 3: التسليم إلى الطبيب (إرسال للفحص)">
            عندما يحين دور المراجع، اضغط على علامة الصح (✔). <strong>هذا الإجراء هو نقطة التسليم الأولى للطبيب.</strong> سيُنقل المراجع إلى قائمة "قيد المعالجة"، وهي إشارتك للطبيب بأن المراجع جاهز لدخول غرفة الفحص.
        </InstructionPoint>
        <InstructionPoint title="الخطوة 4: التسليم من الطبيب (تحصيل الرسوم)">
            بعد انتهاء الطبيب من الفحص، <strong>ستستلم المراجع تلقائياً.</strong> سيظهر في قائمة "بانتظار الدفع" مع إشعار مرئي، وسيكون المبلغ المطلوب محدداً من قبل الطبيب. مهمتك الآن هي الضغط على أيقونة الدولار (💲) لتسجيل المبلغ المدفوع، وبذلك تكتمل الزيارة.
        </InstructionPoint>
    </>
);

const DoctorInstructions: FC = () => (
     <>
        <p className="mb-6 text-gray-700">دليلك للتركيز على الفحص والتنسيق الفعال مع السكرتير.</p>
        <InstructionPoint title="الخطوة 1: استقبال المراجع من السكرتير (بدء الفحص)">
            سيقوم السكرتير بإرسال المراجعين الجاهزين إليك. ستجدهم في قائمة "قيد المعالجة". يمكنك أيضاً إدخال مراجع من قائمة "الانتظار" بنفسك بالضغط على علامة الصح (✔).
        </InstructionPoint>
        <InstructionPoint title="الخطوة 2: التسليم إلى السكرتير (تحديد الرسوم)">
            بعد انتهاء الفحص، <strong>هذه هي نقطة التسليم الرئيسية للسكرتير.</strong> اضغط على أيقونة الترس (⚙️) في بطاقة المراجع. اختر الخدمات المقدمة ثم قم بالتأكيد. سيتم إرسال المراجع تلقائياً إلى السكرتير لتحصيل المبلغ المطلوب. لقد انتهى دورك هنا.
        </InstructionPoint>
         <InstructionPoint title="حالات خاصة وسريعة">
            - <strong>زيارة بدون رسوم:</strong> إذا لم تكن هناك رسوم، ببساطة اضغط على علامة الصح (✔) مرة أخرى لإرسال المراجع مباشرة إلى الأرشيف.
            <br/>
            - <strong>إرجاع للانتظار:</strong> إذا احتجت لإعادة المراجع إلى قائمة الانتظار، استخدم زر الإرجاع (↩️).
        </InstructionPoint>
        <InstructionPoint title="إدارة إعدادات الخدمات">
            من خلال الإعدادات (⚙️)، يمكنك إدارة الخدمات وأسعارها. هذه القائمة هي التي تستخدمها عند تحديد الرسوم، لذا فإن تحديثها مهم لسير العمل.
        </InstructionPoint>
    </>
);


const HelpModal: FC<HelpModalProps> = ({ role, onClose }) => {
  const isDoctor = role === Role.Doctor;
  const title = isDoctor ? "سير العمل (الطبيب)" : "سير العمل (السكرتير)";
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800">دليل الاستخدام السريع</h2>
            <p className="text-sm text-gray-500">{title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </header>
        
        <div className="p-6 flex-grow overflow-y-auto">
            {isDoctor ? <DoctorInstructions /> : <SecretaryInstructions />}
        </div>
        
        <footer className="p-4 border-t bg-gray-50 rounded-b-2xl flex-shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            فهمت، إغلاق
          </button>
        </footer>
      </div>
    </div>
  );
};

export default HelpModal;