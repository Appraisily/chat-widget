import React from 'react';
import { X, Trash2, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatStore } from '../store/chatStore';

interface ChatHeaderProps {
  isConnected: boolean;
  onClose: () => void;
  assistantImage: string;
}

export function ChatHeader({ isConnected, onClose, assistantImage }: ChatHeaderProps) {
  const messages = useChatStore(state => state.messages);
  const clearMessages = useChatStore(state => state.clearMessages);
  const [copied, setCopied] = React.useState(false);

  const handleCopyChat = async () => {
    try {
      const chatHistory = messages
        .map(msg => {
          const sender = msg.clientId ? 'You' : 'Michelle';
          return `${sender}: ${msg.content}`;
        })
        .join('\n\n');

      await navigator.clipboard.writeText(chatHistory);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy chat history:', err);
    }
  };

  return (
    <div className="p-4 border-b bg-gradient-to-r from-[#007bff]/5 to-transparent">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={assistantImage} 
              alt="Michelle - Appraisal Assistant"
              className="w-12 h-12 rounded-full object-cover shadow-sm"
              loading="eager"
            />
            <div className={cn(
              "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
              isConnected ? "bg-emerald-500" : "bg-red-500"
            )} />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">Michelle</span>
            <span className="text-sm text-[#007bff]">Appraisal Assistant</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyChat}
            className={cn(
              "rounded-full p-2 hover:bg-gray-100",
              "text-gray-500 hover:text-gray-700",
              "transition-colors duration-200",
              "relative"
            )}
            title="Copy chat history"
            disabled={messages.length === 0}
          >
            {copied ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={() => clearMessages()}
            className={cn(
              "rounded-full p-2 hover:bg-gray-100",
              "text-gray-500 hover:text-gray-700",
              "transition-colors duration-200"
            )}
            title="Clear chat history"
          >
            <Trash2 className="h-5 w-5" />
          </button>
          <button
            onClick={onClose}
            className={cn(
              "rounded-full p-2 hover:bg-gray-100",
              "text-gray-500 hover:text-gray-700",
              "transition-colors duration-200"
            )}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}