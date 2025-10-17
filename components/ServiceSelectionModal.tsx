import React, { useState } from 'react';
import type { PatientVisit, Service } from '../types.ts';
import { XMarkIcon } from './Icons.tsx';

interface ServiceSelectionModalProps {
  patient: PatientVisit;
  availableServices: Service[];
  onClose: () => void;
  onSave: (patient: PatientVisit, selectedServices: Service[]) => void;
}

const ServiceSelectionModal: React.FC<ServiceSelectionModalProps> = ({ patient, availableServices, onClose, onSave }) => {
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  
  const handleToggleService = (service: Service) => {
    setSelectedServices(prev => 
      prev.some(s => s.id === service.id)
        ? prev.filter(s => s.id !== service.id)
        : [...prev, service]
    );
  };

  const totalAmount = selectedServices.reduce((acc, service) => acc + service.price, 0);

  const handleConfirm = () => {
    onSave(patient, selectedServices);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800">تحديد الرسوم</h2>
            <p className="text-sm text-gray-500">للمراجع: {patient.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </header>
        
        <div className="p-6 flex-grow overflow-y-auto">
          <h3 className="font-semibold text-gray-700 mb-3">اختر الخدمات المقدمة:</h3>
          <div className="space-y-2">
            {availableServices.map(service => {
              const isSelected = selectedServices.some(s => s.id === service.id);
              return (
                <button
                  key={service.id}
                  onClick={() => handleToggleService(service)}
                  className={`w-full text-right flex justify-between items-center p-3 rounded-lg border-2 transition-all duration-200 ${isSelected ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 hover:bg-gray-100 border-gray-200'}`}
                >
                  <span className={`font-semibold ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>{service.name}</span>
                  <span className={`font-bold ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>{service.price.toLocaleString()} د.ع</span>
                </button>
              );
            })}
          </div>
        </div>
        
        <footer className="p-4 border-t bg-gray-50 rounded-b-2xl flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-bold text-gray-800">المجموع الكلي:</span>
            <span className="text-2xl font-extrabold text-blue-600">{totalAmount.toLocaleString()} د.ع</span>
          </div>
          <button
            onClick={handleConfirm}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400"
            disabled={selectedServices.length === 0}
          >
            تأكيد وإرسال للسكرتير
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ServiceSelectionModal;
