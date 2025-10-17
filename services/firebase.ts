import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  Timestamp, 
  doc, 
  updateDoc, 
  deleteDoc,
  setDoc,
  query,
  where,
  getDocs,
  writeBatch,
  limit
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '../types.ts';
import type { Patient, PatientStatus, ClinicSettings } from '../types.ts';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAGcm_YmjwQfodR7uPG1lF33AsEs1eF5rE",
  authDomain: "studio-1806054817-aa9e0.firebaseapp.com",
  projectId: "studio-1806054817-aa9e0",
  storageBucket: "studio-1806054817-aa9e0.appspot.com",
  messagingSenderId: "611346994999",
  appId: "1:611346994999:web:138f1525891169860cecb2"
};

// Initialize Firebase with your project's configuration
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };


export const addPatient = async (patientData: {
    name: string;
    phone: string;
    reason: string;
    age?: number;
    amountPaid?: number;
    showDetailsToPublic?: boolean;
    visitDate?: Date;
}) => {
    if (!db) return;
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
  if (!db) return;
  const patientRef = doc(db, 'queue', id);
  await updateDoc(patientRef, { status });
};

export const updatePatientDetails = async (id: string, details: Partial<Omit<Patient, 'id' | 'createdAt'>>) => {
  if (!db) return;
  const patientRef = doc(db, 'queue', id);
  
  const dataToUpdate: { [key: string]: any } = { ...details };

  Object.keys(dataToUpdate).forEach(key => {
    if (dataToUpdate[key as keyof typeof dataToUpdate] === undefined) {
      delete dataToUpdate[key as keyof typeof dataToUpdate];
    }
  });

  if (Object.keys(dataToUpdate).length > 0) {
    await updateDoc(patientRef, dataToUpdate);
  }
};


export const cancelPatient = async (id: string) => {
  if (!db) return;
  const patientRef = doc(db, 'queue', id);
  await updateDoc(patientRef, { status: 'cancelled' });
};

export const reorderPatientQueue = async (patientId: string, newTimestamp: Timestamp) => {
  if (!db) return;
  const patientRef = doc(db, 'queue', patientId);
  await updateDoc(patientRef, { createdAt: newTimestamp });
};

export const updateClinicSettings = async (settings: Partial<ClinicSettings>) => {
  if (!db) return;
  const settingsRef = doc(db, 'settings', 'clinicConfig');
  const dataToSet: Partial<ClinicSettings> = { ...settings };
  if (dataToSet.services && !Array.isArray(dataToSet.services)) {
    delete dataToSet.services;
  }
  delete dataToSet.doctorPassword;
  delete dataToSet.secretaryPassword;

  await setDoc(settingsRef, dataToSet, { merge: true });
};

export const uploadProfilePicture = async (file: File, role: Role.Doctor | Role.Secretary): Promise<string> => {
  if (!storage) throw new Error("Storage not initialized");
  const filePath = `profile_pictures/${role}`;
  const storageRef = ref(storage, filePath);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

export const uploadChatImage = async (file: File): Promise<string> => {
  if (!storage) throw new Error("Storage not initialized");
  const fileId = uuidv4();
  const storageRef = ref(storage, `chat_images/${fileId}`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

export const addChatMessage = async (message: {
  text?: string;
  imageUrl?: string;
  sender: Role;
}) => {
  if (!db) return;
  const { text, imageUrl, sender } = message;
  if (!text?.trim() && !imageUrl) return;

  await addDoc(collection(db, 'chat'), {
    text: text || null,
    imageUrl: imageUrl || null,
    sender,
    createdAt: Timestamp.now(),
  });
};

export const deleteChatMessage = async (messageId: string) => {
  if (!db) return;
  const messageRef = doc(db, 'chat', messageId);
  await deleteDoc(messageRef);
};

export const archiveOldChatMessages = async (): Promise<number> => {
  if (!db) return 0;
  const twentyFourHoursAgo = Timestamp.fromMillis(Date.now() - 24 * 60 * 60 * 1000);
  const chatCollectionRef = collection(db, 'chat');
  const archiveCollectionRef = collection(db, 'chat_archive');

  let totalArchived = 0;

  while (true) {
    const q = query(
      chatCollectionRef, 
      where('createdAt', '<', twentyFourHoursAgo),
      limit(250)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      break;
    }
    
    const batch = writeBatch(db);
    
    snapshot.forEach(docSnapshot => {
      const archiveDocRef = doc(archiveCollectionRef, docSnapshot.id);
      batch.set(archiveDocRef, docSnapshot.data());
      batch.delete(docSnapshot.ref);
    });
    
    await batch.commit();
    
    totalArchived += snapshot.size;

    if (snapshot.size < 250) {
        break;
    }
  }
  
  return totalArchived;
};

export const getPatientsByDateRange = async (startDate: Date, endDate: Date): Promise<Patient[]> => {
  if (!db) return [];
  const startTimestamp = Timestamp.fromDate(startDate);
  const endTimestamp = Timestamp.fromDate(endDate);
  
  const q = query(
    collection(db, 'queue'),
    where('visitDate', '>=', startTimestamp),
    where('visitDate', '<=', endTimestamp)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Patient[];
};