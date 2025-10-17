
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase.ts';
import { DEFAULT_SETTINGS } from '../constants.ts';
import type { ClinicSettings } from '../types.ts';

export const useSettings = () => {
  const [settings, setSettings] = useState<ClinicSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const settingsRef = doc(db, 'settings', 'clinicConfig');
    const unsubscribe = onSnapshot(settingsRef, (doc) => {
      if (doc.exists()) {
        setSettings({ ...DEFAULT_SETTINGS, ...doc.data() } as ClinicSettings);
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
      setLoading(false);
    }, (err) => {
      setError(err);
      console.error("Error fetching settings: ", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { settings, loading, error };
};
