import React, { useState, useEffect, FC } from 'react';
import { getPatientHistory } from '../services/firebase.ts';
import type { PatientVisit } from '../types.ts';
import { XMarkIcon, SpinnerIcon } from './Icons.tsx';

interface PatientHistoryModalProps {
  patientProfileId: string;
  patientName: string;
  currentVisitId?: string;
  onClose: () => void;
}

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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800">سجل المراجع</h2>
            <p className="text-sm text-gray-500">{patientName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </header>
        
        <div className="p-6 flex-grow overflow-y-auto">
          {loading && (
            <div className="flex justify-center items-center h-full">
              <SpinnerIcon className="w-10 h-10 text-blue-600" />
            </div>
          )}
          {error && <p className="text-center text-red-500">{error}</p>}
          {!loading && !error && (
            history.length > 0 ? (
              <ul className="space-y-4">
                {history.map(visit => {
                  const isCurrentVisit = visit.id === currentVisitId;
                  return (
                    <li key={visit.id} className={`p-4 rounded-lg border ${isCurrentVisit ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <p className={`font-bold ${isCurrentVisit ? 'text-blue-800' : 'text-gray-700'}`}>
                          {visit.visitDate.toDate().toLocaleDateString('ar-SA', {
                            year: 'numeric', month: 'long', day: 'numeric'
                          })}
                        </p>
                        <span className="text-sm font-semibold text-gray-600">{visit.reason || 'زيارة عامة'}</span>
                      </div>
                      
                      {(visit.servicesRendered && visit.servicesRendered.length > 0) || (visit.customLineItems && visit.customLineItems.length > 0) ? (
                        <div className="mb-2 pl-4 border-r-2 border-blue-200 space-y-2">
                           {visit.servicesRendered && visit.servicesRendered.length > 0 && (
                            <div>
                              <h4 className="text-xs font-semibold text-gray-500">الخدمات:</h4>
                              <ul className="list-disc list-inside text-sm text-gray-600">
                                {visit.servicesRendered.map(service => (
                                  <li key={service.id}>{service.name} - {service.price.toLocaleString()} د.ع</li>
                                ))}
                              </ul>
                            </div>
                           )}
                           {visit.customLineItems && visit.customLineItems.length > 0 && (
                            <div>
                               <h4 className="text-xs font-semibold text-gray-500">بنود إضافية/خصومات:</h4>
                               <ul className="list-disc list-inside text-sm text-gray-600">
                                {visit.customLineItems.map((item, index) => (
                                    <li key={index} className={item.price < 0 ? 'text-red-600' : ''}>
                                        {item.description} - {item.price.toLocaleString()} د.ع
                                    </li>
                                ))}
                               </ul>
                            </div>
                           )}
                        </div>
                      ) : null}

                      <div className="flex justify-end gap-6 text-sm pt-2 border-t mt-2">
                          <div>
                              <span className="font-semibold text-gray-500">المبلغ المطلوب: </span>
                              <span className="font-bold text-red-600">{visit.requiredAmount?.toLocaleString() || 0} د.ع</span>
                          </div>
                          <div>
                              <span className="font-semibold text-gray-500">المبلغ المدفوع: </span>
                              <span className="font-bold text-green-600">{visit.amountPaid?.toLocaleString() || 0} د.ع</span>
                          </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-center text-gray-500 pt-10">لا يوجد سجل زيارات لهذا المراجع.</p>
            )
          )}
        </div>
        
        <footer className="p-4 border-t bg-gray-50 rounded-b-2xl flex-shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            إغلاق
          </button>
        </footer>
      </div>
    </div>
  );
};

export default PatientHistoryModal;