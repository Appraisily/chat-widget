import { useEffect, useState } from 'react';
import { useChatStore } from '../store/chatStore';

export function useStoreInitializer() {
  const [isInitialized, setIsInitialized] = useState(false);
  const store = useChatStore();

  useEffect(() => {
    const initialize = async () => {
      if (isInitialized) return;

      try {
        await store.loadMessages();
        setIsInitialized(true);
        console.log('💾 Chat store initialized');
      } catch (error) {
        console.error('Failed to initialize store:', error);
        store.setError('Failed to initialize chat');
      }
    };

    initialize();
  }, [store]);

  return isInitialized;
}