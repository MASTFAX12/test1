import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../services/firebase.ts';
import type { ChatMessage } from '../types.ts';

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Query the last 50 messages, ordered by creation time
    const q = query(
      collection(db, 'chat'), 
      orderBy('createdAt', 'desc'), 
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const messagesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as ChatMessage[];
        // Since we query in descending order, we reverse it for display
        setMessages(messagesData.reverse());
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to parse chat messages'));
        setLoading(false);
      }
    }, (err) => {
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { messages, loading, error };
};
