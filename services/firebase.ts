import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  Timestamp, 
  doc, 
  updateDoc, 
  deleteDoc,
  setDoc
} from 'firebase/firestore';
import type { Patient, PatientStatus, ClinicSettings, Role } from '../types.ts';

// IMPORTANT: Replace with your own Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyAGcm_YmjwQfodR7uPG1lF33AsEs1eF5rE",
  authDomain: "studio-1806054817-aa9e0.firebaseapp.com",
  projectId: "studio-1806054817-aa9e0",
  storageBucket: "studio-1806054817-aa9e0.appspot.com",
  messagingSenderId: "611346994999",
  appId: "1:611346994999:web:138f1525891169860cecb2"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const addPatient = async (patientData: {
    name: string;
    phone: string;
    reason: string;
    age?: number;
    amountPaid?: number;
    showDetailsToPublic?: boolean;
    visitDate?: Date;
}) => {
    const { name, phone, reason, age, amountPaid, showDetailsToPublic, visitDate } = patientData;
    const visitTimestamp = visitDate ? Timestamp.fromDate(visitDate) : Timestamp.now();
    await addDoc(collection(db, 'queue'), {
        name,
        phone: phone || null,
        reason: reason || 'زيارة عامة',
        age: age || null,
        amountPaid: amountPaid ?? null,
        requiredAmount: null,
        servicesRendered: null,
        showDetailsToPublic: showDetailsToPublic || false,
        status: 'waiting',
        createdAt: Timestamp.now(),
        visitDate: visitTimestamp,
    });
};

export const updatePatientStatus = async (id: string, status: PatientStatus) => {
  const patientRef = doc(db, 'queue', id);
  await updateDoc(patientRef, { status });
};

export const updatePatientDetails = async (id: string, details: Partial<Omit<Patient, 'id' | 'createdAt'>>) => {
  const patientRef = doc(db, 'queue', id);
  
  // Create a mutable copy to avoid issues with deleting from a partial type
  const dataToUpdate: { [key: string]: any } = { ...details };

  // Firestore cannot store 'undefined', so we remove keys with undefined values.
  Object.keys(dataToUpdate).forEach(key => {
    if (dataToUpdate[key as keyof typeof dataToUpdate] === undefined) {
      delete dataToUpdate[key as keyof typeof dataToUpdate];
    }
  });

  if (Object.keys(dataToUpdate).length > 0) {
    await updateDoc(patientRef, dataToUpdate);
  }
};


export const deletePatient = async (id: string) => {
  const patientRef = doc(db, 'queue', id);
  await deleteDoc(patientRef);
};

export const updateClinicSettings = async (settings: Partial<ClinicSettings>) => {
  const settingsRef = doc(db, 'settings', 'clinicConfig');
  // Make sure services array is handled correctly
  const dataToSet = { ...settings };
  if (dataToSet.services && !Array.isArray(dataToSet.services)) {
    delete dataToSet.services; // Avoid saving invalid data
  }
  await setDoc(settingsRef, dataToSet, { merge: true });
};

export const addChatMessage = async (text: string, sender: Role) => {
  if (!text.trim()) return;
  await addDoc(collection(db, 'chat'), {
    text,
    sender,
    createdAt: Timestamp.now(),
  });
};