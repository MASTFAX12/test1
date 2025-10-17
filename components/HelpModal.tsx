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
        <p className="text-sm text-gray-600 leading-relaxed pr-2 border-r-2 border-blue-200">{children}</p>
    </div>
);

const SecretaryInstructions: FC = () => (
    <>
        <InstructionPoint title="1. إضافة مراجع جديد">
            من الشريط الجانبي، استخدم قسم "إضافة" لملء بيانات المراجع. الاسم هو الحقل الوحيد الإلزامي. بعد الإضافة، سيظهر المراجع تلقائياً في قائمة "الانتظار".
        </InstructionPoint>
        <InstructionPoint title="2. إدارة قائمة الانتظار">
            - <strong>النداء (🔔):</strong> اضغط على زر الجرس للنداء على المراجع. سيظهر اسمه بشكل بارز على الشاشة العامة مع تنبيه صوتي.
            <br/>
            - <strong>إدخال للفحص (✔):</strong> اضغط على زر الصح لإرسال المراجع إلى الطبيب. سينتقل إلى قائمة "قيد المعالجة" ويختفي من قائمة الانتظار.
            <br/>
            - <strong>إعادة الترتيب:</strong> يمكنك سحب وإفلات بطاقات المراجعين في قائمة "الانتظار" فقط لتغيير ترتيبهم حسب الأولوية.
        </InstructionPoint>
         <InstructionPoint title="3. معالجة الدفع">
            عندما ينهي الطبيب الفحص، سيظهر المراجع في قائمة "بانتظار الدفع" مع إشعار مرئي. اضغط على زر الدولار (💲) لتسجيل المبلغ المدفوع ونقله للأرشيف.
        </InstructionPoint>
        <InstructionPoint title="4. إجراءات أخرى">
            - <strong>تعديل (✏️):</strong> لتحديث بيانات المراجع في أي وقت.
            <br/>
            - <strong>إرجاع للانتظار (↩️):</strong> لإعادة مراجع من "قيد المعالجة" إلى قائمة الانتظار.
            <br/>
            - <strong>سجل المراجع (🗃️):</strong> لعرض سجل زيارات المراجع السابقة وتفاصيلها المالية.
        </InstructionPoint>
    </>
);

const DoctorInstructions: FC = () => (
     <>
        <InstructionPoint title="1. سير عمل المراجع">
            يقوم السكرتير بإضافة المراجعين إلى قائمة "الانتظار". دورك يبدأ من هناك.
        </InstructionPoint>
        <InstructionPoint title="2. بدء الفحص">
            عندما تكون مستعداً للمراجع التالي، اضغط على زر الصح (✔) بجانب اسمه في قائمة "الانتظار". سينتقل المراجع إلى قائمة "قيد المعالجة" وسيظهر اسمه على الشاشة العامة.
        </InstructionPoint>
         <InstructionPoint title="3. تحديد الرسوم وإرسال للدفع">
            بعد انتهاء الفحص، اضغط على زر الترس (⚙️) في بطاقة المراجع وهو في حالة "قيد المعالجة". ستظهر لك نافذة لتحديد الخدمات المقدمة. بعد تأكيدك، سيتم إرسال المراجع تلقائياً إلى قائمة "بانتظار الدفع" لدى السكرتير مع المبلغ المطلوب.
        </InstructionPoint>
        <InstructionPoint title="4. إنهاء الزيارة بدون رسوم">
            إذا كانت الزيارة لا تتطلب دفعاً (مثلاً، مراجعة سريعة أو استشارة)، اضغط على زر الصح (✔) في بطاقة المراجع وهو في حالة "قيد المعالجة". سيتم نقله مباشرة إلى الأرشيف كزيارة مكتملة.
        </InstructionPoint>
        <InstructionPoint title="5. الإعدادات الشاملة">
            استخدم الزر الأزرق العائم (⚙️) في أسفل الشاشة للوصول إلى لوحة الإعدادات. من هناك يمكنك التحكم بكل شيء: اسم العيادة، الخدمات والأسعار، كلمات المرور، والمظهر العام.
        </InstructionPoint>
    </>
);


const HelpModal: FC<HelpModalProps> = ({ role, onClose }) => {
  const isDoctor = role === Role.Doctor;
  const title = isDoctor ? "تعليمات الطبيب" : "تعليمات السكرتير";
  
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