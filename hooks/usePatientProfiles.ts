import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase.ts';
import type { PatientProfile } from '../types.ts';

export const usePatientProfiles = () => {
  const [patientProfiles, setPatientProfiles] = useState<PatientProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'patients'), orderBy('firstVisit', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const profilesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as PatientProfile[];
      setPatientProfiles(profilesData);
      setLoading(false);
    }, (err) => {
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { patientProfiles, loading, error };
};