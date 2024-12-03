import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useWebSocket } from '@/lib/websocket';
import { useChatStore } from '../store/chatStore';
import type { Message } from '../store/types';
import type { ImageData } from '@/lib/websocket/types';

export function useChat() {
  const { connectionState, send } = useWebSocket();
  const store = useChatStore();

  const sendMessage = useCallback(async (content: string, images: ImageData[] = []) => {
    if (!content.trim() && !images.length) {
      store.setError('Message cannot be empty');
      return;
    }

    if (connectionState.status !== 'connected') {
      store.setError('Not connected to chat server');
      return;
    }

    try {
      const messageId = uuidv4();
      const message: Message = {
        type: 'message',
        content: content.trim(),
        images: images.map(img => img.data), // Keep existing image display format
        timestamp: new Date().toISOString(),
        id: messageId,
        clientId: connectionState.clientId || undefined,
        status: {
          sent: true,
          received: false,
          processed: false
        }
      };

      // First add message to local store
      await store.addMessage(message);

      // Then send to server with new image format
      send({
        type: 'message',
        content: message.content,
        images: images,
        messageId: message.id,
        conversationId: connectionState.conversationId
      });

      store.setTyping(true);
    } catch (error) {
      console.error('Failed to send message:', error);
      store.setError('Failed to send message');
    }
  }, [connectionState, send, store]);

  return {
    messages: store.messages,
    isConnected: connectionState.status === 'connected',
    isTyping: store.isTyping,
    error: store.error,
    clientId: connectionState.clientId,
    conversationId: connectionState.conversationId,
    sendMessage,
    clearError: () => store.setError(null),
    clearMessages: store.clearMessages
  };
}