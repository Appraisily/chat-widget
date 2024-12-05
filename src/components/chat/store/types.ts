export interface ImageStatus {
  imageId: string;
  status: 'received' | 'processing' | 'analyzed';
}

export interface Message {
  id: string;
  type: 'message' | 'system';
  content: string;
  timestamp: string;
  clientId?: string;
  images?: string[];
  imageStatuses?: ImageStatus[];
  status?: {
    sent?: boolean;
    received?: boolean;
    processed?: boolean;
  };
}

export interface ChatState {
  messages: Message[];
  isTyping: boolean;
  error: string | null;
  email: string | null;
  showEmailDialog: boolean;
}