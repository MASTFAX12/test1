
import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase.ts';
import type { Patient } from '../types.ts';

export const useQueue = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'queue'), orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const patientsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Patient[];
        setPatients(patientsData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to parse patient data'));
        setLoading(false);
      }
    }, (err) => {
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { patients, loading, error };
};