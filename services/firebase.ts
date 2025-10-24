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
import { Role, PatientStatus } from '../types.ts';
import type { PatientVisit, PatientStatus as PatientStatusType, ClinicSettings, PatientProfile } from '../types.ts';

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

export { db };

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
            age: details.age === undefined ? patientDoc.data().age : details.age,
        });
        return patientDoc.id;
    }

    // 3. If not found, create a new patient profile
    const newPatientRef = await addDoc(patientsRef, {
        name: details.name,
        phone: details.phone || null,
        age: details.age === undefined ? null : details.age,
        firstVisit: Timestamp.now(),
    });
    return newPatientRef.id;
};


export const addPatientVisit = async (patientData: {
    name: string;
    phone: string;
    reason: string;
    age?: number;
    showDetailsToPublic?: boolean;
    visitDate?: Date;
}) => {
    if (!db) return;
    const { name, phone, reason, age, showDetailsToPublic, visitDate } = patientData;

    // Get or create the patient profile first
    const patientProfileId = await findOrCreatePatientProfile({ name, phone, age });

    const visitTimestamp = visitDate ? Timestamp.fromDate(visitDate) : Timestamp.now();
    await addDoc(collection(db, 'queue'), {
        patientProfileId,
        name,
        phone: phone || null,
        reason: reason || 'زيارة عامة',
        age: age === undefined ? null : age,
        isPaid: false,
        paymentAmount: null,
        paymentNotes: null,
        clinicalNotes: null,
        showDetailsToPublic: showDetailsToPublic || false,
        status: PatientStatus.Waiting,
        createdAt: Timestamp.now(), // For queue order
        visitDate: visitTimestamp,
        wasExamined: false,
    });
};

export const updatePatientStatus = async (id: string, status: PatientStatusType) => {
  if (!db) return;
  const patientRef = doc(db, 'queue', id);
  await updateDoc(patientRef, { status });
};

export const updatePatientDetails = async (id: string, details: Partial<Omit<PatientVisit, 'id'>>) => {
  if (!db) return;
  const patientRef = doc(db, 'queue', id);
  
  const dataToUpdate: { [key: string]: any } = { ...details };

  // This logic should also update the main patient profile if name/age/phone changes
  if (details.patientProfileId && (details.name || details.phone || details.age !== undefined)) {
      const profileRef = doc(db, 'patients', details.patientProfileId);
      const profileUpdate: Partial<PatientProfile> = {};
      if (details.name) profileUpdate.name = details.name;
      if (details.phone) profileUpdate.phone = details.phone;
      if (details.age !== undefined) profileUpdate.age = details.age;
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


export const archivePatientVisit = async (id: string) => {
  if (!db) return;
  const patientRef = doc(db, 'queue', id);
  await updateDoc(patientRef, { status: PatientStatus.Archived });
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
  // Passwords are now managed via settings, so we need to include them.
  // The old logic `delete dataToSet.doctorPassword` is removed.

  await setDoc(settingsRef, dataToSet, { merge: true });
};

export const addChatMessage = async (message: {
  text: string;
  sender: Role;
}) => {
  if (!db) return;
  const { text, sender } = message;
  if (!text.trim()) return;

  await addDoc(collection(db, 'chat'), {
    text,
    sender,
    createdAt: Timestamp.now(),
  });
};

export const updateChatMessage = async (messageId: string, text: string) => {
  if (!db) return;
  const messageRef = doc(db, 'chat', messageId);
  await updateDoc(messageRef, { text });
};

export const deleteChatMessage = async (messageId: string) => {
  if (!db) return;
  const messageRef = doc(db, 'chat', messageId);
  await deleteDoc(messageRef);
};

export const archiveAllChatMessages = async (): Promise<number> => {
  if (!db) return 0;
  const chatCollectionRef = collection(db, 'chat');
  const archiveCollectionRef = collection(db, 'chat_archive');
  const BATCH_SIZE = 249; // Safely under Firestore's 500-operation limit (249 * 2 ops = 498)

  let totalArchived = 0;

  while (true) {
    const q = query(
      chatCollectionRef, 
      limit(BATCH_SIZE)
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

    if (snapshot.size < BATCH_SIZE) {
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

export const archiveVisitsByIds = async (visitIds: string[]): Promise<number> => {
    // This function is now deprecated as we no longer move files.
    // Kept to avoid breaking imports, but it does nothing.
    return Promise.resolve(0);
};

export const archiveOldPatientVisits = async (olderThanDays: number): Promise<number> => {
    // This function is now deprecated as we no longer move files.
    // Kept to avoid breaking imports, but it does nothing.
    return Promise.resolve(0);
};

export const clearActiveQueue = async (): Promise<number> => {
  if (!db) return 0;
  const queueCollectionRef = collection(db, 'queue');
  const statusesToClear = [PatientStatus.Waiting, PatientStatus.InProgress, PatientStatus.PendingExamination, PatientStatus.PendingPayment];

  const q = query(queueCollectionRef, where('status', 'in', statusesToClear));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return 0;
  }

  const batch = writeBatch(db);
  snapshot.forEach(docSnapshot => {
    batch.update(docSnapshot.ref, { status: PatientStatus.Archived });
  });

  await batch.commit();
  return snapshot.size;
};

// --- NEW FUNCTIONS FOR PATIENT ARCHIVE ---

export const updatePatientProfile = async (profileId: string, details: Partial<Omit<PatientProfile, 'id'>>) => {
    if (!db) throw new Error("Firestore not initialized");

    const batch = writeBatch(db);

    // 1. Update the main patient profile document
    const profileRef = doc(db, 'patients', profileId);
    batch.update(profileRef, details);

    // 2. Update denormalized data in all associated visit documents
    const denormalizedDetails: Partial<PatientVisit> = {};
    if (details.name) denormalizedDetails.name = details.name;
    if (details.phone) denormalizedDetails.phone = details.phone;
    if (details.age !== undefined) denormalizedDetails.age = details.age;

    if (Object.keys(denormalizedDetails).length > 0) {
        const visitsQuery = query(collection(db, 'queue'), where('patientProfileId', '==', profileId));
        const visitsSnapshot = await getDocs(visitsQuery);
        visitsSnapshot.forEach(visitDoc => {
            batch.update(visitDoc.ref, denormalizedDetails);
        });
    }
    
    await batch.commit();
};

export const deletePatientProfile = async (profileId: string) => {
    if (!db) throw new Error("Firestore not initialized");

    const batch = writeBatch(db);

    // 1. Find and delete all associated visit documents
    const visitsQuery = query(collection(db, 'queue'), where('patientProfileId', '==', profileId));
    const visitsSnapshot = await getDocs(visitsQuery);
    visitsSnapshot.forEach(visitDoc => {
        batch.delete(visitDoc.ref);
    });

    // 2. Delete the main patient profile document
    const profileRef = doc(db, 'patients', profileId);
    batch.delete(profileRef);

    await batch.commit();
    return visitsSnapshot.size; // Return number of visits deleted
};
