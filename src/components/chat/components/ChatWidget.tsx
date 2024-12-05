import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WebSocketProvider } from '@/lib/websocket';
import { ChatContainer } from './ChatContainer';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <div className="flex flex-col items-end gap-2">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200 max-w-[200px] animate-pulse">
            <p className="text-sm text-gray-900">
              Chat with Michelle, our Assistant
            </p>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-full",
              "bg-[#007bff] text-white shadow-lg",
              "hover:bg-[#0056b3] transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-[#007bff]/50 focus:ring-offset-2"
            )}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="font-medium">Chat with Michelle</span>
          </button>
        </div>
      ) : (
        <WebSocketProvider>
          <ChatContainer onClose={() => setIsOpen(false)} />
        </WebSocketProvider>
      )}
    </div>
  );
}