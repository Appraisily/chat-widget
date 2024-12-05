import { create } from 'zustand';
import { get as idbGet, set as idbSet } from 'idb-keyval';
import type { ChatState, Message, ImageStatus } from './types';

const MESSAGES_KEY = 'chat_messages';
const EMAIL_KEY = 'chat_email';

interface ChatStore extends ChatState {
  addMessage: (message: Message) => Promise<void>;
  setTyping: (isTyping: boolean) => void;
  setError: (error: string | null) => void;
  loadMessages: () => Promise<void>;
  clearMessages: () => Promise<void>;
  updateMessageStatus: (messageId: string, status: Partial<Message['status']>) => void;
  updateImageStatus: (messageId: string, imageStatus: ImageStatus) => void;
  handleResponse: (response: any) => Promise<void>;
  setEmail: (email: string | null) => Promise<void>;
  setShowEmailDialog: (show: boolean) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isTyping: false,
  error: null,
  email: null,
  showEmailDialog: false,

  setError: (error: string | null) => set({ error }),
  
  setTyping: (isTyping: boolean) => set({ isTyping }),

  setEmail: async (email: string | null) => {
    try {
      await idbSet(EMAIL_KEY, email);
      set({ email });
    } catch (error) {
      console.error('Failed to save email:', error);
    }
  },

  setShowEmailDialog: (show: boolean) => set({ showEmailDialog: show }),

  updateMessageStatus: (messageId: string, status: Partial<Message['status']>) => {
    const messages = get().messages.map(msg => {
      if (msg.id === messageId) {
        return {
          ...msg,
          status: {
            ...msg.status,
            ...status
          }
        };
      }
      return msg;
    });
    
    set({ messages });
    idbSet(MESSAGES_KEY, messages).catch(console.error);
  },

  updateImageStatus: (messageId: string, imageStatus: ImageStatus) => {
    const messages = get().messages.map(msg => {
      if (msg.id === messageId) {
        const existingStatuses = msg.imageStatuses || [];
        const updatedStatuses = existingStatuses.map(status => 
          status.imageId === imageStatus.imageId ? imageStatus : status
        );
        
        if (!existingStatuses.find(s => s.imageId === imageStatus.imageId)) {
          updatedStatuses.push(imageStatus);
        }

        return {
          ...msg,
          imageStatuses: updatedStatuses
        };
      }
      return msg;
    });
    
    set({ messages });
    idbSet(MESSAGES_KEY, messages).catch(console.error);
  },

  handleResponse: async (response) => {
    if (response.type === 'confirm') {
      get().updateMessageStatus(response.messageId, {
        received: true,
        processed: true
      });
      return;
    }

    if (response.type === 'image_status') {
      get().updateImageStatus(response.messageId, {
        imageId: response.imageId,
        status: response.status
      });
      return;
    }

    if (response.type === 'status') {
      const isProcessing = ['typing', 'thinking', 'processing'].includes(response.status);
      set({ isTyping: isProcessing });
      return;
    }

    if (response.type === 'response' && !get().messages.find(m => m.id === response.messageId)) {
      const message: Message = {
        id: response.messageId,
        type: 'message',
        content: response.content,
        timestamp: response.timestamp,
        status: {
          sent: true,
          received: true,
          processed: true
        }
      };

      await get().addMessage(message);
      set({ isTyping: false });
    }
  },

  addMessage: async (message: Message) => {
    try {
      const currentMessages = get().messages;
      const updatedMessages = [...currentMessages, message];
      set({ messages: updatedMessages });
      await idbSet(MESSAGES_KEY, updatedMessages);
    } catch (error) {
      console.error('Failed to save message:', error);
      set({ error: 'Failed to save message' });
    }
  },

  loadMessages: async () => {
    try {
      const [savedMessages, savedEmail] = await Promise.all([
        idbGet<Message[]>(MESSAGES_KEY),
        idbGet<string>(EMAIL_KEY)
      ]);
      
      set({ 
        messages: Array.isArray(savedMessages) ? savedMessages : [],
        email: savedEmail || null
      });
      console.log('💾 Chat store initialized');
    } catch (error) {
      console.error('Failed to load messages:', error);
      set({ messages: [], error: 'Failed to load messages' });
    }
  },

  clearMessages: async () => {
    try {
      await idbSet(MESSAGES_KEY, []);
      set({ messages: [] });
    } catch (error) {
      console.error('Failed to clear messages:', error);
      set({ error: 'Failed to clear messages' });
    }
  }
}));