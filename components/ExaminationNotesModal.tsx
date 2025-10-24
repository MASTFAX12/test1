import React, { useState, FC, useRef } from 'react';
import { SpinnerIcon, XMarkIcon, ClipboardDocumentListIcon, SparklesIcon, PaperAirplaneIcon, PencilIcon, TrashIcon, CheckIcon } from './Icons.tsx';
import type { PatientVisit } from '../types.ts';
import { toast } from 'react-hot-toast';

interface ExaminationNotesModalProps {
  patient: PatientVisit;
  onClose: () => void;
  onSave: (patientId: string, notes: string) => Promise<void>;
  onEdit?: (patientId: string, noteIndex: number, newText: string) => Promise<void>;
  noteToEdit?: { index: number; text: string };
  quickNotes: string[];
  onUpdateQuickNotes: (newNotes: string[]) => Promise<void>;
}

const QuickNoteButton: FC<{ text: string, onClick: () => void }> = ({ text, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className="text-xs font-semibold text-slate-600 bg-slate-200/70 hover:bg-slate-300/80 p-2 rounded-lg transition-colors text-center"
    >
        {text}
    </button>
);


const ExaminationNotesModal: FC<ExaminationNotesModalProps> = ({ patient, onClose, onSave, onEdit, noteToEdit, quickNotes, onUpdateQuickNotes }) => {
  const isEditing = !!(noteToEdit && onEdit);
  const [notes, setNotes] = useState(isEditing ? noteToEdit.text : '');
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // State for managing the quick notes editor
  const [isEditingQuickNotes, setIsEditingQuickNotes] = useState(false);
  const [localQuickNotes, setLocalQuickNotes] = useState(quickNotes);
  const [newQuickNoteText, setNewQuickNoteText] = useState('');
  const [editingQuickNote, setEditingQuickNote] = useState<{ index: number; text: string } | null>(null);

  const handleSaveClick = async () => {
    if (!notes.trim()) {
        toast.error(isEditing ? 'لا يمكن ترك الملاحظة فارغة.' : 'الرجاء كتابة الملاحظات المطلوبة للفحص.');
        return;
    }
    setIsSaving(true);
    if (isEditing) {
        await onEdit(patient.id, noteToEdit.index, notes);
    } else {
        await onSave(patient.id, notes);
    }
    setIsSaving(false);
  };

  const handleAddPatientNote = (text: string) => {
    setNotes(prev => prev ? `${prev}\n- ${text}` : `- ${text}`);
    textareaRef.current?.focus();
  };

  // Handlers for localQuickNotes array
  const handleAddQuickNoteItem = () => {
    if (newQuickNoteText.trim()) {
      setLocalQuickNotes(prev => [...prev, newQuickNoteText.trim()]);
      setNewQuickNoteText('');
    }
  };
  
  const handleDeleteQuickNoteItem = (indexToDelete: number) => {
    setLocalQuickNotes(prev => prev.filter((_, index) => index !== indexToDelete));
  };
  
  const handleSaveQuickNoteEdit = () => {
    if (editingQuickNote && editingQuickNote.text.trim()) {
      const updatedNotes = [...localQuickNotes];
      updatedNotes[editingQuickNote.index] = editingQuickNote.text.trim();
      setLocalQuickNotes(updatedNotes);
      setEditingQuickNote(null);
    } else {
        setEditingQuickNote(null);
    }
  };

  const handleSaveQuickNotesChanges = async () => {
    setIsSaving(true);
    await onUpdateQuickNotes(localQuickNotes);
    setIsSaving(false);
    setIsEditingQuickNotes(false);
  };
  
  if (isEditingQuickNotes) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[51] p-4 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
          <header className="flex justify-between items-center p-4 border-b flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-800">تعديل الجمل السريعة</h2>
            <button onClick={() => setIsEditingQuickNotes(false)} className="p-2 rounded-full hover:bg-gray-100"><XMarkIcon className="w-6 h-6 text-gray-600" /></button>
          </header>
          <div className="p-6 flex-grow overflow-y-auto space-y-4">
            <div className="space-y-2">
              {localQuickNotes.map((note, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border">
                  {editingQuickNote?.index === index ? (
                    <input 
                      type="text" 
                      value={editingQuickNote.text}
                      onChange={(e) => setEditingQuickNote({ ...editingQuickNote, text: e.target.value })}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveQuickNoteEdit(); if(e.key === 'Escape') setEditingQuickNote(null); }}
                      className="form-input flex-grow text-sm"
                      autoFocus
                    />
                  ) : (
                    <p className="flex-grow text-sm text-slate-700">{note}</p>
                  )}
                  <div className="flex items-center">
                    {editingQuickNote?.index === index ? (
                      <>
                        <button onClick={handleSaveQuickNoteEdit} className="p-2 text-green-600 hover:bg-green-100 rounded-full"><CheckIcon className="w-4 h-4" /></button>
                        <button onClick={() => setEditingQuickNote(null)} className="p-2 text-slate-500 hover:bg-slate-200 rounded-full"><XMarkIcon className="w-4 h-4" /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditingQuickNote({ index, text: note })} className="p-2 text-slate-500 hover:bg-slate-200 rounded-full"><PencilIcon className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteQuickNoteItem(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="w-4 h-4" /></button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <input 
                type="text" 
                value={newQuickNoteText}
                onChange={(e) => setNewQuickNoteText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddQuickNoteItem(); } }}
                placeholder="إضافة جملة جديدة..."
                className="form-input flex-grow"
              />
              <button onClick={handleAddQuickNoteItem} className="bg-slate-200 text-slate-700 font-bold px-4 rounded-lg hover:bg-slate-300">إضافة</button>
            </div>
          </div>
          <footer className="p-4 border-t bg-gray-50 rounded-b-2xl flex-shrink-0 flex justify-end gap-3">
            <button onClick={() => { setIsEditingQuickNotes(false); setLocalQuickNotes(quickNotes); }} className="bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 font-bold py-2.5 px-6 rounded-lg shadow-sm">إلغاء</button>
            <button onClick={handleSaveQuickNotesChanges} disabled={isSaving} className="w-40 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg shadow-md text-white bg-[var(--theme-color)] hover:opacity-90 disabled:bg-gray-400">
              {isSaving ? <SpinnerIcon className="w-5 h-5"/> : 'حفظ التغييرات'}
            </button>
          </footer>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{isEditing ? 'تعديل ملاحظة الفحص' : 'ملاحظات عند الفحص'}</h2>
            <p className="text-sm text-gray-500">للمراجع: {patient.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </header>
        <div className="p-6 flex-grow flex flex-col min-h-0">
            {!isEditing && (
              <>
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <SparklesIcon className="w-5 h-5 text-[var(--theme-color)]" />
                            <span>إضافة سريعة</span>
                        </h3>
                        <button onClick={() => setIsEditingQuickNotes(true)} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:bg-blue-100 p-1.5 rounded-md transition-colors">
                            <PencilIcon className="w-3.5 h-3.5"/>
                            <span>إضافة/تعديل الجمل</span>
                        </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {quickNotes.map(note => (
                            <QuickNoteButton key={note} text={note} onClick={() => handleAddPatientNote(note)} />
                        ))}
                    </div>
                </div>

                <div className="my-4 border-t border-dashed border-slate-300"></div>
                <p className="text-center text-xs text-slate-500 -mt-2 mb-4">حقل قابل للتعديل والحذف والإضافة</p>
              </>
            )}

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
            {isSaving ? <SpinnerIcon className="w-5 h-5"/> : isEditing ? 'حفظ التعديل' : <><PaperAirplaneIcon className="w-5 h-5"/> <span>إرسال للفحص</span></>}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ExaminationNotesModal;