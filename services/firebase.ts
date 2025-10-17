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
export const storage = getStorage(app);


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

export const uploadProfilePicture = async (file: File, role: Role.Doctor | Role.Secretary): Promise<string> => {
  const filePath = `profile_pictures/${role}`;
  const storageRef = ref(storage, filePath);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

export const uploadChatImage = async (file: File): Promise<string> => {
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
  const { text, imageUrl, sender } = message;
  if (!text?.trim() && !imageUrl) return;

  await addDoc(collection(db, 'chat'), {
    text: text || null,
    imageUrl: imageUrl || null,
    sender,
    createdAt: Timestamp.now(),
  });
};

export const archiveOldChatMessages = async (): Promise<number> => {
  const twentyFourHoursAgo = Timestamp.fromMillis(Date.now() - 24 * 60 * 60 * 1000);
  const chatCollectionRef = collection(db, 'chat');
  const archiveCollectionRef = collection(db, 'chat_archive');

  let totalArchived = 0;

  while (true) {
    // Query for old messages, processing in chunks of 250 (500 operations)
    // to stay within Firestore's batch write limits.
    const q = query(
      chatCollectionRef, 
      where('createdAt', '<', twentyFourHoursAgo),
      limit(250)
    );
    
    const snapshot = await getDocs(q);
    
    // If no more documents are found, break the loop
    if (snapshot.empty) {
      break;
    }
    
    const batch = writeBatch(db);
    
    snapshot.forEach(docSnapshot => {
      // Add to archive collection
      const archiveDocRef = doc(archiveCollectionRef, docSnapshot.id);
      batch.set(archiveDocRef, docSnapshot.data());
      
      // Delete from original chat collection
      batch.delete(docSnapshot.ref);
    });
    
    await batch.commit();
    
    totalArchived += snapshot.size;

    // If we processed less than the limit, we know we're done and can exit early.
    if (snapshot.size < 250) {
        break;
    }
  }
  
  return totalArchived;
};