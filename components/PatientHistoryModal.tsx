import React, { useState, useEffect, FC, useMemo } from 'react';
import { getPatientHistory } from '../services/firebase.ts';
import type { PatientVisit } from '../types.ts';
import { XMarkIcon, SpinnerIcon, ClipboardDocumentListIcon, PaperAirplaneIcon } from './Icons.tsx';

interface PatientHistoryModalProps {
  patientProfileId: string;
  patientName: string;
  currentVisitId?: string;
  onClose: () => void;
}

interface ParsedNotes {
    mainNotes: string;
    examinationNotes: {
        timestamp: string;
        notes: string;
    }[];
}

const parseClinicalNotes = (notes?: string): ParsedNotes => {
    if (!notes) {
        return { mainNotes: '', examinationNotes: [] };
    }

    const examinationNotes: { timestamp: string; notes: string }[] = [];
    const separatorRegex = /--- ملاحظات للفحص \[(.*?)] ---\n/g;
    
    const parts = notes.split(separatorRegex);
    let mainNotes = parts[0].trim();
    
    if (parts.length > 1) {
        for (let i = 1; i < parts.length; i += 2) {
            examinationNotes.push({
                timestamp: parts[i],
                notes: parts[i + 1].trim(),
            });
        }
    } else {
        mainNotes = notes.trim();
    }

    return { mainNotes, examinationNotes };
};

const PatientHistoryModal: FC<PatientHistoryModalProps> = ({ patientProfileId, patientName, currentVisitId, onClose }) => {
  const [history, setHistory] = useState<PatientVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const patientHistory = await getPatientHistory(patientProfileId);
        setHistory(patientHistory);
      } catch (err) {
        console.error("Failed to fetch patient history:", err);
        setError("فشل في تحميل سجل المراجع.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [patientProfileId]);

  const VisitItem: FC<{ visit: PatientVisit }> = ({ visit }) => {
      const { mainNotes, examinationNotes } = useMemo(() => parseClinicalNotes(visit.clinicalNotes), [visit.clinicalNotes]);
      const isCurrentVisit = visit.id === currentVisitId;

      return (
        <li className={`p-4 rounded-lg border ${isCurrentVisit ? 'bg-slate-50 border-[var(--theme-color)] shadow-md' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
            <p className={`font-bold text-lg ${isCurrentVisit ? 'text-[var(--theme-color)]' : 'text-gray-700'}`}>
              {visit.visitDate.toDate().toLocaleDateString('ar-SA', {
                year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
              })}
            </p>
            <span className="text-sm font-semibold text-gray-600 bg-white border border-gray-200 px-2 py-1 rounded-md">{visit.reason || 'زيارة عامة'}</span>
          </div>
          
          <div className="space-y-4">
              {mainNotes && (
                <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-1.5 flex items-center gap-2">
                        <ClipboardDocumentListIcon className="w-5 h-5 text-gray-400"/>
                        <span>الملاحظات السريرية</span>
                    </h4>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-100 p-3 rounded-md border border-gray-200">{mainNotes}</p>
                </div>
              )}

              {examinationNotes.length > 0 && (
                 <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-1.5 flex items-center gap-2">
                         <PaperAirplaneIcon className="w-5 h-5 text-gray-400"/>
                        <span>طلبات الفحص</span>
                    </h4>
                    <div className="space-y-2">
                    {examinationNotes.map((examNote, index) => (
                        <div key={index} className="bg-purple-50 p-3 rounded-md border border-purple-200">
                            <p className="text-xs font-semibold text-purple-700 mb-1">بتاريخ: {examNote.timestamp}</p>
                            <p className="text-sm text-purple-900 whitespace-pre-wrap">{examNote.notes}</p>
                        </div>
                    ))}
                    </div>
                </div>
              )}
          </div>
          
          {(visit.paymentAmount || visit.paymentNotes) && (
              <div className="mt-4 pt-3 border-t border-gray-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm">
                  <div className="text-gray-600">
                    {visit.paymentNotes && (
                      <>
                        <span className="font-semibold">ملاحظات الدفع: </span>
                        <span>{visit.paymentNotes}</span>
                      </>
                    )}
                  </div>
                  <div>
                      <span className="font-semibold text-gray-600">المبلغ المدفوع: </span>
                      <span className="font-bold text-base text-green-600">{visit.paymentAmount?.toLocaleString() || 0} د.ع</span>
                  </div>
              </div>
          )}
        </li>
      );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800">سجل المراجع</h2>
            <p className="text-sm text-gray-500">{patientName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </header>
        
        <div className="p-6 flex-grow overflow-y-auto bg-gray-50/50">
          {loading && (
            <div className="flex justify-center items-center h-full">
              <SpinnerIcon className="w-10 h-10 text-[var(--theme-color)]" />
            </div>
          )}
          {error && <p className="text-center text-red-500">{error}</p>}
          {!loading && !error && (
            history.length > 0 ? (
              <ul className="space-y-4">
                {history.map(visit => <VisitItem key={visit.id} visit={visit} />)}
              </ul>
            ) : (
              <p className="text-center text-gray-500 pt-10">لا يوجد سجل زيارات لهذا المراجع.</p>
            )
          )}
        </div>
        
        <footer className="p-4 border-t bg-gray-100 rounded-b-2xl flex-shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[var(--theme-color)] hover:opacity-90 text-white font-bold py-2.5 px-8 rounded-lg transition-colors shadow-sm"
          >
            إغلاق
          </button>
        </footer>
      </div>
    </div>
  );
};

export default PatientHistoryModal;
