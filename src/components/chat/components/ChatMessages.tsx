import React from 'react';
import { cn } from '@/lib/utils';
import { MessageStatus } from './MessageStatus';
import type { Message } from '../store/types';

interface ChatMessagesProps {
  messages: Message[];
  clientId: string | null;
  isTyping: boolean;
  assistantImage: string;
}

export function ChatMessages({ messages, clientId, isTyping, assistantImage }: ChatMessagesProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = React.useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, []);

  // Scroll to bottom when messages change or typing status changes
  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Handle manual scroll and preserve position
  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 50;
      
      // Store scroll position preference
      container.dataset.autoScroll = isAtBottom.toString();
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      ref={scrollContainerRef}
      className="h-full overflow-y-auto overflow-x-hidden p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
    >
      {messages.map((message) => {
        const isUserMessage = message.clientId === clientId;
        const isSystemMessage = message.type === 'system';
        
        // Initialize default status
        const messageStatus = {
          sent: true,
          received: false,
          processed: false,
          ...message.status
        };
        
        if (isSystemMessage) {
          return (
            <div key={message.id} className="flex justify-center">
              <div className="bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-600">
                {message.content}
              </div>
            </div>
          );
        }
        
        return (
          <div
            key={message.id}
            className={cn(
              "flex gap-2",
              isUserMessage ? "justify-end" : "justify-start"
            )}
          >
            {!isUserMessage && (
              <div className="flex-shrink-0 w-8 h-8">
                <img 
                  src={assistantImage}
                  alt="Assistant"
                  className="rounded-full object-cover shadow-sm"
                  loading="lazy"
                />
              </div>
            )}

            <div className={cn(
              "group relative flex flex-col max-w-[80%] space-y-2",
              isUserMessage ? "items-end" : "items-start"
            )}>
              <div className={cn(
                "px-4 py-2.5 rounded-2xl text-sm",
                isUserMessage 
                  ? "bg-[#007bff] text-white rounded-br-none" 
                  : "bg-gray-100 text-gray-900 rounded-bl-none shadow-sm"
              )}>
                <p className="whitespace-pre-wrap break-words">
                  {message.content}
                </p>

                {message.images?.map((image, index) => (
                  <div key={index} className="relative mt-2">
                    <img
                      src={image}
                      alt="Uploaded content"
                      className="rounded-lg max-w-full"
                      loading="lazy"
                    />
                    {message.imageStatuses?.map(status => (
                      <div 
                        key={status.imageId}
                        className={cn(
                          "absolute bottom-2 right-2 px-2 py-1 rounded text-xs",
                          status.status === 'received' && "bg-blue-500 text-white",
                          status.status === 'processing' && "bg-yellow-500 text-white",
                          status.status === 'analyzed' && "bg-green-500 text-white"
                        )}
                      >
                        {status.status}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {isUserMessage && (
                <MessageStatus 
                  status={messageStatus}
                  className="absolute -bottom-4 right-1"
                />
              )}

              <div className={cn(
                "absolute -bottom-5 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity",
                isUserMessage ? "right-0" : "left-0"
              )}>
                {new Date(message.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        );
      })}

      {isTyping && (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8">
            <img 
              src={assistantImage}
              alt="Assistant"
              className="rounded-full object-cover shadow-sm"
            />
          </div>
          <div className="bg-gray-100 px-4 py-2.5 rounded-2xl rounded-bl-none shadow-sm">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#007bff]/40 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-[#007bff]/40 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-[#007bff]/40 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}