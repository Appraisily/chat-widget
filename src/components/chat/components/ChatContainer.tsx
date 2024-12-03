import React from 'react';
import { useChat } from '../hooks/useChat';
import { useStoreInitializer } from '../hooks/useStoreInitializer';
import { useWebSocket } from '@/lib/websocket';
import { Card } from '@/components/ui/card'; 
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { EmailDialog } from './EmailDialog';
import { cn } from '@/lib/utils';

const ASSISTANT_IMAGE = "https://ik.imagekit.io/appraisily/WebPage/michelle.png?tr=w-64,h-64,q-80,f-auto";

interface ChatContainerProps {
  onClose: () => void;
}

export function ChatContainer({ onClose }: ChatContainerProps) {
  const isInitialized = useStoreInitializer();
  const { connect, disconnect } = useWebSocket();
  const mountedRef = React.useRef(true);
  const hasConnectedRef = React.useRef(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const dropZoneRef = React.useRef<HTMLDivElement>(null);

  const { 
    messages, 
    isConnected, 
    isTyping,
    error,
    clientId,
    sendMessage,
    clearError,
  } = useChat();

  // Handle initial connection
  React.useEffect(() => {
    const initializeConnection = async () => {
      if (isInitialized && mountedRef.current && !hasConnectedRef.current) {
        try {
          hasConnectedRef.current = true;
          console.log('🔄 Initiating chat connection');
          await connect();
        } catch (error) {
          console.error('Failed to initialize connection:', error);
          hasConnectedRef.current = false;
        }
      }
    };

    initializeConnection();
  }, [isInitialized, connect]);

  // Setup drag and drop event listeners
  React.useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (!dropZone) return;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (e.dataTransfer?.types.includes('Files')) {
        setIsDragging(true);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (e.dataTransfer?.types.includes('Files')) {
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Only set dragging to false if we're leaving the drop zone
      const rect = dropZone.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;
      
      if (
        x <= rect.left ||
        x >= rect.right ||
        y <= rect.top ||
        y >= rect.bottom
      ) {
        setIsDragging(false);
      }
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer?.files || []);
      const imageFiles = files.filter(file => file.type.startsWith('image/'));

      if (imageFiles.length > 0) {
        const file = imageFiles[0]; // For now, handle only the first image
        try {
          const reader = new FileReader();
          const imageData = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          await sendMessage('', [{
            data: imageData,
            mimeType: file.type
          }]);
        } catch (error) {
          console.error('Failed to process dropped image:', error);
          clearError();
        }
      }
    };

    dropZone.addEventListener('dragenter', handleDragEnter);
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);

    return () => {
      dropZone.removeEventListener('dragenter', handleDragEnter);
      dropZone.removeEventListener('dragover', handleDragOver);
      dropZone.removeEventListener('dragleave', handleDragLeave);
      dropZone.removeEventListener('drop', handleDrop);
    };
  }, [sendMessage, clearError]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      mountedRef.current = false;
      console.log('👋 Chat container unmounting');
      disconnect();
    };
  }, [disconnect]);

  const handleClose = React.useCallback(() => {
    console.log('🔌 Closing chat');
    disconnect();
    onClose();
  }, [disconnect, onClose]);

  if (!isInitialized) {
    return (
      <Card className="w-[380px] h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Initializing chat...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      ref={dropZoneRef}
      className={cn(
        "w-[380px] h-[600px] flex flex-col relative transition-all duration-200",
        isDragging && "ring-2 ring-blue-500 ring-opacity-50"
      )}
    >
      {isDragging && (
        <div className="absolute inset-0 bg-blue-500/5 backdrop-blur-[1px] flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white px-6 py-3 rounded-xl shadow-lg border border-blue-100">
            <p className="text-blue-600 font-medium">Drop image here</p>
          </div>
        </div>
      )}
      
      <ChatHeader 
        isConnected={isConnected} 
        onClose={handleClose}
        assistantImage={ASSISTANT_IMAGE}
      />
      
      <div className="relative flex-1 overflow-hidden">
        <ChatMessages 
          messages={messages}
          clientId={clientId}
          isTyping={isTyping}
          assistantImage={ASSISTANT_IMAGE}
        />
        <EmailDialog />
      </div>

      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-100 text-red-600 text-sm">
          {error}
          <button 
            onClick={clearError}
            className="ml-2 text-red-800 hover:text-red-900"
          >
            Dismiss
          </button>
        </div>
      )}

      <ChatInput onSendMessage={sendMessage} />
    </Card>
  );
}