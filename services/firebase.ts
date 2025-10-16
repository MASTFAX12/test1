import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  Timestamp, 
  doc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import type { PatientStatus } from '../types';

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

export const addPatient = async (name: string, phone: string, reason: string) => {
  await addDoc(collection(db, 'queue'), {
    name,
    phone: phone || null,
    reason: reason || 'زيارة عامة',
    status: 'waiting',
    createdAt: Timestamp.now(),
  });
};

export const updatePatientStatus = async (id: string, status: PatientStatus) => {
  const patientRef = doc(db, 'queue', id);
  await updateDoc(patientRef, { status });
};

export const updatePatientDetails = async (id: string, details: { name: string; phone?: string; reason?: string }) => {
  const patientRef = doc(db, 'queue', id);
  await updateDoc(patientRef, {
    name: details.name,
    phone: details.phone || null,
    reason: details.reason || 'زيارة عامة',
  });
};

export const deletePatient = async (id: string) => {
  const patientRef = doc(db, 'queue', id);
  await deleteDoc(patientRef);
};