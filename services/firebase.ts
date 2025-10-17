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
  limit,
  orderBy
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '../types.ts';
import type { PatientVisit, PatientStatus, ClinicSettings, PatientProfile } from '../types.ts';

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

// Finds an existing patient profile or creates a new one.
// Returns the ID of the patient profile.
export const findOrCreatePatientProfile = async (details: { name: string; phone: string; age?: number }): Promise<string> => {
    if (!db) throw new Error("Firestore not initialized");
    const patientsRef = collection(db, 'patients');
    
    // 1. Try to find by phone number if provided, as it's more unique
    if (details.phone) {
        const q = query(patientsRef, where('phone', '==', details.phone), limit(1));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            return snapshot.docs[0].id;
        }
    }
    
    // 2. If no phone or not found, try to find by name (less reliable)
    const qByName = query(patientsRef, where('name', '==', details.name), limit(1));
    const snapshotByName = await getDocs(qByName);
    if (!snapshotByName.empty) {
        // Optionally update details if found by name
        const patientDoc = snapshotByName.docs[0];
        await updateDoc(doc(db, 'patients', patientDoc.id), {
            phone: details.phone || patientDoc.data().phone || null,
            age: details.age || patientDoc.data().age || null,
        });
        return patientDoc.id;
    }

    // 3. If not found, create a new patient profile
    const newPatientRef = await addDoc(patientsRef, {
        name: details.name,
        phone: details.phone || null,
        age: details.age || null,
        firstVisit: Timestamp.now(),
    });
    return newPatientRef.id;
};


export const addPatientVisit = async (patientData: {
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

    // Get or create the patient profile first
    const patientProfileId = await findOrCreatePatientProfile({ name, phone, age });

    const visitTimestamp = visitDate ? Timestamp.fromDate(visitDate) : Timestamp.now();
    await addDoc(collection(db, 'queue'), {
        patientProfileId,
        name,
        phone: phone || null,
        reason: reason || 'زيارة عامة',
        age: age || null,
        amountPaid: amountPaid ?? null,
        requiredAmount: null,
        servicesRendered: null,
        customLineItems: null,
        showDetailsToPublic: showDetailsToPublic || false,
        status: 'waiting',
        createdAt: Timestamp.now(), // For queue order
        visitDate: visitTimestamp,
    });
};

export const updatePatientStatus = async (id: string, status: PatientStatus) => {
  if (!db) return;
  const patientRef = doc(db, 'queue', id);
  await updateDoc(patientRef, { status });
};

export const updatePatientDetails = async (id: string, details: Partial<Omit<PatientVisit, 'id' | 'createdAt'>>) => {
  if (!db) return;
  const patientRef = doc(db, 'queue', id);
  
  const dataToUpdate: { [key: string]: any } = { ...details };

  // This logic should also update the main patient profile if name/age/phone changes
  if (details.patientProfileId && (details.name || details.phone || details.age)) {
      const profileRef = doc(db, 'patients', details.patientProfileId);
      const profileUpdate: Partial<PatientProfile> = {};
      if (details.name) profileUpdate.name = details.name;
      if (details.phone) profileUpdate.phone = details.phone;
      if (details.age) profileUpdate.age = details.age;
      await updateDoc(profileRef, profileUpdate);
  }


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

export const deletePatientVisit = async (id: string) => {
  if (!db) return;
  const patientRef = doc(db, 'queue', id);
  await deleteDoc(patientRef);
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
  // Passwords are now managed via settings, so we need to include them.
  // The old logic `delete dataToSet.doctorPassword` is removed.

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

export const getPatientsByDateRange = async (startDate: Date, endDate: Date): Promise<PatientVisit[]> => {
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
  })) as PatientVisit[];
};

export const getPatientHistory = async (patientProfileId: string): Promise<PatientVisit[]> => {
    if (!db) return [];
    const q = query(
        collection(db, 'queue'),
        where('patientProfileId', '==', patientProfileId)
        // The orderBy('visitDate', 'desc') clause was removed to avoid needing a composite index.
        // Sorting is now handled on the client-side after fetching the data.
    );
    const snapshot = await getDocs(q);
    const visits = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    })) as PatientVisit[];

    // Sort visits by date in descending order (newest first)
    visits.sort((a, b) => b.visitDate.toMillis() - a.visitDate.toMillis());

    return visits;
};