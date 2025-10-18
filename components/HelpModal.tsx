import React, { FC } from 'react';
import { Role } from '../types.ts';
import { XMarkIcon } from './Icons.tsx';

interface HelpModalProps {
  role: Role;
  onClose: () => void;
}

const InstructionPoint: FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-4">
        <h4 className="font-bold text-[var(--theme-color)] mb-1">{title}</h4>
        <div className="text-sm text-gray-600 leading-relaxed pr-2 border-r-2 border-[var(--theme-color)] border-opacity-30">{children}</div>
    </div>
);

const SecretaryInstructions: FC = () => (
    <>
        <p className="mb-6 text-gray-700">دليلك لإدارة تدفق المرضى بسلاسة والتنسيق الفعال مع الطبيب.</p>
        <InstructionPoint title="الخطوة 1: تسجيل المراجع">
            <ul className="list-disc pr-4 space-y-1">
                <li>استخدم زر الإضافة الأزرق (+) لتسجيل مراجع جديد.</li>
                <li>سيظهر المراجع فوراً في قائمة <strong>"الانتظار"</strong>، ليصبح مرئياً لك وللطبيب.</li>
            </ul>
        </InstructionPoint>
        <InstructionPoint title="الخطوة 2: إدارة قائمة الانتظار">
             <ul className="list-disc pr-4 space-y-1">
                <li><strong>للتنظيم:</strong> غير أولوية المراجعين بسهولة عبر <strong>السحب والإفلات</strong>.</li>
                <li><strong>للنداء:</strong> استخدم أيقونة الجرس (🔔) للنداء على المراجع.</li>
                <li><strong>للتعديل:</strong> استخدم أيقونة القلم (✏️) لتحديث بيانات المراجع.</li>
            </ul>
        </InstructionPoint>
         <InstructionPoint title="الخطوة 3: إرسال المراجع للفحص (التسليم للطبيب)">
            <ul className="list-disc pr-4 space-y-1">
                <li>عندما يحين دور المراجع، اضغط على <strong>أيقونة الصح (✔)</strong>.</li>
                <li>هذا الإجراء ينقل المراجع إلى قائمة <strong>"قيد المعالجة"</strong>، وهو إشعارك للطبيب بأن المراجع جاهز لدخول غرفة الفحص.</li>
            </ul>
        </InstructionPoint>
        <InstructionPoint title="الخطوة 4: تحصيل الرسوم (الاستلام من الطبيب)">
            <ul className="list-disc pr-4 space-y-1">
                <li>بعد انتهاء الطبيب من الفحص وتحديد الرسوم، <strong>ستستلم المراجع تلقائياً</strong> في قائمة <strong>"بانتظار الدفع"</strong>.</li>
                <li>ستلاحظ إشعاراً مرئياً وبطاقة مميزة.</li>
                <li>مهمتك الآن هي الضغط على <strong>أيقونة الدولار (💲)</strong> لتسجيل المبلغ المدفوع، وبذلك تكتمل الزيارة ويتم أرشفتها.</li>
            </ul>
        </InstructionPoint>
    </>
);

const DoctorInstructions: FC = () => (
     <>
        <p className="mb-6 text-gray-700">دليلك للتركيز على الفحص والتنسيق السلس مع السكرتير.</p>
        <InstructionPoint title="الخطوة 1: بدء الفحص (الاستلام من السكرتير)">
             <ul className="list-disc pr-4 space-y-1">
                <li>السكرتير سيجهز المراجعين ويرسلهم إلى قائمة <strong>"قيد المعالجة"</strong>، وهي قائمة عملك الرئيسية.</li>
                <li>يمكنك أيضاً إدخال مراجع من قائمة "الانتظار" بنفسك بالضغط على <strong>أيقونة الصح (✔)</strong>.</li>
            </ul>
        </InstructionPoint>
        <InstructionPoint title="الخطوة 2: إنهاء الفحص وتحديد الرسوم (التسليم للسكرتير)">
            <ul className="list-disc pr-4 space-y-1">
                <li>بعد انتهاء الفحص، اضغط على <strong>أيقونة الترس (⚙️)</strong> في بطاقة المراجع.</li>
                <li>اختر الخدمات المقدمة، أضف أي بنود مخصصة، ثم قم بالتأكيد.</li>
                <li>هذا الإجراء هو <strong>نقطة التسليم الرئيسية للسكرتير</strong>. سيتم إرسال المراجع تلقائياً لتحصيل المبلغ، وبذلك ينتهي دورك.</li>
            </ul>
        </InstructionPoint>
         <InstructionPoint title="حالات خاصة">
            <ul className="list-disc pr-4 space-y-1">
                <li><strong>زيارة بدون رسوم:</strong> إذا لم تكن هناك رسوم (مثل مراجعة سريعة)، ببساطة اضغط على <strong>أيقونة الصح (✔)</strong> مرة أخرى لإرسال المراجع مباشرة إلى الأرشيف.</li>
                <li><strong>إرجاع للانتظار:</strong> إذا احتجت لإعادة المراجع إلى قائمة الانتظار لأي سبب، استخدم <strong>أيقونة الإرجاع (↩️)</strong>.</li>
            </ul>
        </InstructionPoint>
        <InstructionPoint title="إدارة الخدمات والأسعار">
            <ul className="list-disc pr-4 space-y-1">
                <li>من <strong>الإعدادات (⚙️) في الهيدر</strong>، يمكنك إضافة وتعديل الخدمات وأسعارها.</li>
                <li>هذه القائمة هي التي تستخدمها عند تحديد الرسوم، لذا فإن تحديثها يضمن سير العمل بسلاسة.</li>
            </ul>
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
            className="bg-[var(--theme-color)] hover:opacity-90 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            فهمت، إغلاق
          </button>
        </footer>
      </div>
    </div>
  );
};

export default HelpModal;