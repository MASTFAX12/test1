import React, { useState } from 'react';
import type { Patient } from '../types.ts';
import { updatePatientDetails } from '../services/firebase.ts';

interface EditablePatientCardProps {
  patient: Patient;
  onCancel: () => void;
  onSave: () => void;
}

const EditablePatientCard: React.FC<EditablePatientCardProps> = ({ patient, onCancel, onSave }) => {
  const [name, setName] = useState(patient.name);
  const [phone, setPhone] = useState(patient.phone || '');
  const [reason, setReason] = useState(patient.reason || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return; // Basic validation
    setIsSaving(true);
    try {
      await updatePatientDetails(patient.id, { name, phone, reason });
      onSave();
    } catch (error) {
      console.error("Failed to update patient details:", error);
      // Optionally show an error message to the user
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-blue-50 border-2 border-blue-400 rounded-xl p-4 mb-3 shadow-lg animate-fade-in">
      <form onSubmit={handleSave} className="space-y-3">
        <div>
          <label className="text-xs font-bold text-gray-600">الاسم</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            required
            autoFocus
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-600">الهاتف</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-600">السبب</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-3 rounded-md transition duration-200 text-xs"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded-md transition duration-200 text-xs disabled:bg-gray-400"
          >
            {isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditablePatientCard;