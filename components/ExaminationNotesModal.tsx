import React, { useState, FC } from 'react';
import { SpinnerIcon, XMarkIcon, ClipboardDocumentListIcon, SparklesIcon } from './Icons.tsx';
import type { PatientVisit } from '../types.ts';
import { toast } from 'react-hot-toast';

interface ExaminationNotesModalProps {
  patient: PatientVisit;
  onClose: () => void;
  onSave: (patientId: string, notes: string) => Promise<void>;
}

const QUICK_NOTES = [
    'فحص الشبكية',
    'فحص قاع العين',
    'قياس ضغط العين',
    'فحص النظر',
    'فحص الساحة البصرية',
    'صورة مقطعية للشبكية (OCT)',
    'تصوير الأوعية بالفلوريسين',
    'فحص العدسات اللاصقة'
];

const QuickNoteButton: FC<{ text: string, onClick: () => void }> = ({ text, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className="text-xs font-semibold text-slate-600 bg-slate-200/70 hover:bg-slate-300/80 p-2 rounded-lg transition-colors text-center"
    >
        {text}
    </button>
);


const ExaminationNotesModal: FC<ExaminationNotesModalProps> = ({ patient, onClose, onSave }) => {
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSaveClick = async () => {
    if (!notes.trim()) {
        toast.error('الرجاء كتابة الملاحظات المطلوبة للفحص.');
        return;
    }
    setIsSaving(true);
    await onSave(patient.id, notes);
    // The parent component will handle closing and toast messages
    setIsSaving(false);
  };

  const handleAddQuickNote = (text: string) => {
    setNotes(prev => prev ? `${prev}\n- ${text}` : `- ${text}`);
    textareaRef.current?.focus();
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800">ملاحظات للفحص</h2>
            <p className="text-sm text-gray-500">للمراجع: {patient.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </header>
        <div className="p-6 flex-grow flex flex-col min-h-0">
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-[var(--theme-color)]" />
                    <span>إضافة سريعة</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {QUICK_NOTES.map(note => (
                        <QuickNoteButton key={note} text={note} onClick={() => handleAddQuickNote(note)} />
                    ))}
                </div>
            </div>

            <div className="flex-grow flex flex-col">
                <label htmlFor="exam-notes" className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <ClipboardDocumentListIcon className="w-5 h-5 text-slate-500" />
                    <span>تفاصيل الفحص المطلوب</span>
                </label>
                <textarea
                    id="exam-notes"
                    ref={textareaRef}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="form-input flex-grow w-full resize-none"
                    placeholder="اكتب تفاصيل الفحص المطلوب هنا..."
                    rows={5}
                    autoFocus
                />
            </div>
        </div>
        <footer className="p-4 border-t bg-gray-50 rounded-b-2xl flex-shrink-0 flex justify-end gap-3">
          <button onClick={onClose} className="bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm">إلغاء</button>
          <button onClick={handleSaveClick} disabled={isSaving} className="w-48 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg shadow-md text-white bg-[var(--theme-color)] hover:opacity-90 disabled:bg-gray-400 transition-all">
            {isSaving ? <SpinnerIcon className="w-5 h-5"/> : 'إرسال للفحص'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ExaminationNotesModal;