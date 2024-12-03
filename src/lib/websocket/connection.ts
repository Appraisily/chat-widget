import { WEBSOCKET_URL, HEARTBEAT_INTERVAL } from '../constants/websocket';
import type { ConnectionState, ChatMessage, MessageConfirmation, MessageResponse } from './types';

export class WebSocketConnection {
  private ws: WebSocket | null = null;
  private clientId: string;
  private conversationId: string | null = null;
  private onStateChange: (state: ConnectionState) => void;
  private onResponse: (response: MessageResponse) => void;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageCallbacks = new Map<string, (confirmation: MessageConfirmation) => void>();

  constructor(
    clientId: string, 
    onStateChange: (state: ConnectionState) => void,
    onResponse: (response: MessageResponse) => void
  ) {
    this.clientId = clientId;
    this.onStateChange = onStateChange;
    this.onResponse = onResponse;
    console.log('🔌 Initializing WebSocket connection');
  }

  public connect = () => {
    if (this.ws) {
      console.log('WebSocket already exists');
      return;
    }

    console.log('🔌 Creating WebSocket instance');
    this.ws = new WebSocket(WEBSOCKET_URL);

    this.ws.onopen = () => {
      console.log('🔌 WebSocket connection established');
      
      // Send initial connect message
      const connectMessage = {
        type: 'connect',
        clientId: this.clientId,
        timestamp: new Date().toISOString()
      };

      console.log('📤 Sending connect message:', connectMessage);
      this.ws?.send(JSON.stringify(connectMessage));
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📥 Received message:', data);

        switch (data.type) {
          case 'connect_confirm':
            if (data.status === 'confirmed') {
              console.log('✅ Connection confirmed');
              this.conversationId = data.conversationId;
              this.onStateChange({
                status: 'connected',
                clientId: this.clientId,
                conversationId: data.conversationId,
                error: null
              });
              this.startHeartbeat();
            }
            break;

          case 'response':
            console.log('📥 Received response message:', data);
            this.onResponse(data);
            break;

          case 'confirm':
            console.log('📥 Received message confirmation:', data);
            const callback = this.messageCallbacks.get(data.messageId);
            if (callback) {
              callback(data);
              this.messageCallbacks.delete(data.messageId);
            }
            break;

          case 'error':
            console.error('❌ Server error:', data.error);
            break;

          default:
            console.log('📥 Received unknown message type:', data.type);
        }
      } catch (error) {
        console.error('❌ Failed to parse message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('🔌 WebSocket connection closed');
      this.cleanup();
      this.onStateChange({
        status: 'disconnected',
        clientId: this.clientId,
        conversationId: null,
        error: null
      });
    };

    this.ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      this.cleanup();
      this.onStateChange({
        status: 'disconnected',
        clientId: this.clientId,
        conversationId: null,
        error: 'Connection failed'
      });
    };

    this.onStateChange({
      status: 'connecting',
      clientId: this.clientId,
      conversationId: null,
      error: null
    });
  };

  public disconnect = () => {
    console.log('🔌 Disconnecting WebSocket');
    this.cleanup();
    this.onStateChange({
      status: 'disconnected',
      clientId: this.clientId,
      conversationId: null,
      error: null
    });
  };

  public send = (message: Partial<ChatMessage>) => {
    if (!this.ws || !this.conversationId) {
      throw new Error('WebSocket not connected');
    }

    const fullMessage: ChatMessage = {
      ...message,
      type: 'message',
      clientId: this.clientId,
      conversationId: this.conversationId,
      timestamp: new Date().toISOString()
    } as ChatMessage;

    return new Promise<MessageConfirmation>((resolve) => {
      this.messageCallbacks.set(fullMessage.messageId, resolve);
      console.log('📤 Sending message:', fullMessage);
      this.ws?.send(JSON.stringify(fullMessage));
    });
  };

  private startHeartbeat = () => {
    console.log('💓 Starting heartbeat');
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        const pingMessage = {
          type: 'ping',
          clientId: this.clientId,
          timestamp: new Date().toISOString()
        };
        console.log('💓 Sending heartbeat');
        this.ws.send(JSON.stringify(pingMessage));
      }
    }, HEARTBEAT_INTERVAL);
  };

  private cleanup = () => {
    if (this.heartbeatInterval) {
      console.log('💓 Stopping heartbeat');
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.conversationId = null;
    this.messageCallbacks.clear();
  };
}