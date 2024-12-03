export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export interface ConnectionState {
  status: ConnectionStatus;
  clientId: string | null;
  conversationId: string | null;
  error: string | null;
}

export interface ImageData {
  data: string;
  mimeType: string;
}

export interface WebSocketMessage {
  type: string;
  clientId: string;
  timestamp: string;
}

export interface ConnectMessage extends WebSocketMessage {
  type: 'connect';
}

export interface ConnectConfirmMessage extends WebSocketMessage {
  type: 'connect_confirm';
  conversationId: string;
  status: 'confirmed';
}

export interface ChatMessage extends WebSocketMessage {
  type: 'message';
  messageId: string;
  conversationId: string;
  content?: string;
  images?: ImageData[];
}

export interface MessageConfirmation extends WebSocketMessage {
  type: 'confirm';
  messageId: string;
  status: 'received';
}

export interface MessageResponse extends WebSocketMessage {
  type: 'response';
  messageId: string;
  replyTo: string;
  content: string;
}

export interface ImageStatus extends WebSocketMessage {
  type: 'image_status';
  messageId: string;
  imageId: string;
  status: 'received' | 'processing' | 'analyzed';
}

export interface StatusMessage extends WebSocketMessage {
  type: 'status';
  messageId: string;
  status: 'idle' | 'thinking' | 'processing';
}

export interface PingMessage extends WebSocketMessage {
  type: 'ping';
}

export interface ErrorMessage extends WebSocketMessage {
  type: 'error';
  error: string;
}