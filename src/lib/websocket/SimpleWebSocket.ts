import { WEBSOCKET_URL, HEARTBEAT_INTERVAL } from '../constants/websocket';
import type { ConnectionState } from './types';

export class SimpleWebSocket {
  private ws: WebSocket | null = null;
  private clientId: string;
  private onStateChange: (state: ConnectionState) => void;
  private onMessage: (message: any) => void;
  private lastPingTime: number = 0;
  private pingTimeout: NodeJS.Timeout | null = null;
  private isIntentionalClose: boolean = false;
  private INACTIVITY_TIMEOUT = 180000; // 180 seconds (3 minutes)
  private messageCallbacks = new Map<string, (confirmation: any) => void>();
  private processedMessageIds = new Set<string>();
  private MESSAGE_CONFIRMATION_TIMEOUT = 10000; // 10 seconds
  private MAX_PROCESSED_IDS = 1000;

  constructor(
    clientId: string, 
    onStateChange: (state: ConnectionState) => void,
    onMessage: (message: any) => void
  ) {
    this.clientId = clientId;
    this.onStateChange = onStateChange;
    this.onMessage = onMessage;
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

        // Check for duplicate messages
        if (data.messageId && this.processedMessageIds.has(data.messageId)) {
          console.log('🔄 Duplicate message received, ignoring:', data.messageId);
          return;
        }

        if (data.type === 'connect_confirm' && data.status === 'confirmed') {
          console.log('✅ Connection confirmed');
          this.onStateChange({
            status: 'connected',
            clientId: this.clientId,
            conversationId: data.conversationId,
            error: null
          });
          this.resetPingTimeout();
        } 
        else if (data.type === 'ping') {
          this.handlePing();
        }
        else if (data.type === 'confirm') {
          const callback = this.messageCallbacks.get(data.messageId);
          if (callback) {
            console.log('✅ Message confirmed:', data.messageId);
            callback(data);
            this.messageCallbacks.delete(data.messageId);
          }
        }

        // Store processed message ID
        if (data.messageId) {
          this.processedMessageIds.add(data.messageId);
          this.cleanupProcessedIds();
        }

        // Forward message to handler
        this.onMessage(data);

      } catch (error) {
        console.error('❌ Failed to parse message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('🔌 WebSocket connection closed');
      this.cleanup();

      if (!this.isIntentionalClose) {
        this.onStateChange({
          status: 'disconnected',
          clientId: this.clientId,
          conversationId: null,
          error: 'Session ended due to inactivity'
        });
      } else {
        this.onStateChange({
          status: 'disconnected',
          clientId: this.clientId,
          conversationId: null,
          error: null
        });
      }
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
    this.isIntentionalClose = true;
    this.cleanup();
  };

  public send = (data: any) => {
    if (!this.ws) {
      throw new Error('WebSocket not connected');
    }

    const message = {
      ...data,
      clientId: this.clientId,
      timestamp: new Date().toISOString()
    };

    return new Promise<void>((resolve, reject) => {
      try {
        if (message.messageId) {
          this.messageCallbacks.set(message.messageId, () => {
            console.log('✅ Message confirmed:', message.messageId);
            resolve();
          });

          setTimeout(() => {
            if (this.messageCallbacks.has(message.messageId)) {
              console.warn('⚠️ Message confirmation timeout:', message.messageId);
              this.messageCallbacks.delete(message.messageId);
              reject(new Error('Message confirmation timeout'));
            }
          }, this.MESSAGE_CONFIRMATION_TIMEOUT);
        }

        console.log('📤 Sending message:', message);
        this.ws?.send(JSON.stringify(message));

        if (!message.messageId) {
          resolve();
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  private handlePing = () => {
    this.lastPingTime = Date.now();
    
    const pongMessage = {
      type: 'pong',
      clientId: this.clientId,
      timestamp: new Date().toISOString()
    };
    
    console.log('💓 Sending pong response');
    this.ws?.send(JSON.stringify(pongMessage));
    this.resetPingTimeout();
  };

  private resetPingTimeout = () => {
    if (this.pingTimeout) {
      clearTimeout(this.pingTimeout);
    }

    this.pingTimeout = setTimeout(() => {
      console.log('⏰ Inactivity timeout reached');
      this.isIntentionalClose = false;
      this.cleanup();
      
      this.onStateChange({
        status: 'disconnected',
        clientId: this.clientId,
        conversationId: null,
        error: 'Session ended due to inactivity'
      });
    }, this.INACTIVITY_TIMEOUT);
  };

  private cleanupProcessedIds = () => {
    if (this.processedMessageIds.size > this.MAX_PROCESSED_IDS) {
      const idsToKeep = Array.from(this.processedMessageIds).slice(-this.MAX_PROCESSED_IDS);
      this.processedMessageIds.clear();
      idsToKeep.forEach(id => this.processedMessageIds.add(id));
    }
  };

  private cleanup = () => {
    if (this.pingTimeout) {
      clearTimeout(this.pingTimeout);
      this.pingTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageCallbacks.clear();
    this.processedMessageIds.clear();
  };
}