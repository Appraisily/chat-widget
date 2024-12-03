const STORAGE_KEYS = {
  CLIENT_ID: 'chat_client_id',
  CONVERSATION_ID: 'chat_conversation_id',
  MESSAGES: 'chat_messages'
} as const;

export function getStorageItem<T>(key: keyof typeof STORAGE_KEYS): T | null {
  try {
    const item = localStorage.getItem(STORAGE_KEYS[key]);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error);
    return null;
  }
}

export function setStorageItem<T>(key: keyof typeof STORAGE_KEYS, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to storage:`, error);
  }
}

export function removeStorageItem(key: keyof typeof STORAGE_KEYS): void {
  try {
    localStorage.removeItem(STORAGE_KEYS[key]);
  } catch (error) {
    console.error(`Error removing ${key} from storage:`, error);
  }
}

export function clearStorage(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
}