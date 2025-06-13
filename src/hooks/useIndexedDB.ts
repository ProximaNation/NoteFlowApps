import { useEffect, useState } from 'react';
import { db } from '@/services/indexedDB';

export function useIndexedDB() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initDB = async () => {
      try {
        await db.init();
        setIsInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize IndexedDB'));
        console.error('Failed to initialize IndexedDB:', err);
      }
    };

    initDB();
  }, []);

  return { isInitialized, error, db };
} 