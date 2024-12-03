import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import { SimpleWebSocket } from './SimpleWebSocket';
import { useChatStore } from '@/components/chat/store/chatStore';
import type { ConnectionState } from './types';

interface WebSocketContextValue {
  connectionState: ConnectionState;
  connect: () => void;
  disconnect: () => void;
  send: (message: any) => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

const WebSocketProviderComponent = ({ children }: { children: React.ReactNode }) => {
  const store = useChatStore();
  const mountedRef = useRef(true);
  const connectionRef = useRef<SimpleWebSocket | null>(null);
  const clientIdRef = useRef<string>(localStorage.getItem('chat_client_id') || '');
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: 'disconnected',
    clientId: clientIdRef.current,
    conversationId: null,
    error: null
  });

  const handleConnectionStateChange = useCallback((state: ConnectionState) => {
    setConnectionState(state);
    if (state.status === 'disconnected' && state.error?.includes('inactivity')) {
      store.setShowEmailDialog(true);
    }
  }, [store]);

  const handleMessage = useCallback(async (message: any) => {
    if (message.type === 'response') {
      await store.handleResponse(message);
    }
  }, [store]);

  const connect = useCallback(() => {
    if (!connectionRef.current && mountedRef.current) {
      console.log('🔌 Connection requested');
      connectionRef.current = new SimpleWebSocket(
        clientIdRef.current,
        handleConnectionStateChange,
        handleMessage
      );
      connectionRef.current.connect();
    }
  }, [handleMessage, handleConnectionStateChange]);

  const disconnect = useCallback(() => {
    if (connectionRef.current) {
      connectionRef.current.disconnect();
      connectionRef.current = null;
    }
  }, []);

  const send = useCallback((message: any) => {
    if (!connectionRef.current) {
      throw new Error('WebSocket not connected');
    }
    connectionRef.current.send(message);
  }, []);

  React.useEffect(() => {
    mountedRef.current = true;
    console.log('🔧 Initializing WebSocket provider');

    return () => {
      mountedRef.current = false;
      if (connectionRef.current) {
        console.log('🧹 Cleaning up WebSocket provider');
        disconnect();
      }
    };
  }, [disconnect]);

  const value = React.useMemo(() => ({
    connectionState,
    connect,
    disconnect,
    send
  }), [connectionState, connect, disconnect, send]);

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const WebSocketProvider = React.memo(WebSocketProviderComponent);

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}