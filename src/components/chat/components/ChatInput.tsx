import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ImageIcon, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ImagePreview } from './ImagePreview';
import type { ImageData } from '@/lib/websocket/types';

interface ChatInputProps {
  onSendMessage: (content: string, images?: ImageData[]) => Promise<void>;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = useCallback(async () => {
    if (isProcessing || (!input.trim() && !selectedImage)) {
      return;
    }

    setIsProcessing(true);
    try {
      let images: ImageData[] = [];
      if (selectedImage) {
        const reader = new FileReader();
        const imageData = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(selectedImage);
        });
        
        images = [{
          data: imageData,
          mimeType: selectedImage.type
        }];
      }

      await onSendMessage(input, images);
      setInput('');
      setSelectedImage(null);
      
      // Refocus the input after a short delay to ensure the DOM has updated
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [input, selectedImage, isProcessing, onSendMessage]);

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
    }
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t bg-card">
      {selectedImage && (
        <div className="mb-4">
          <ImagePreview
            image={selectedImage}
            onRemove={() => setSelectedImage(null)}
            disabled={isProcessing}
          />
        </div>
      )}
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1"
          disabled={isProcessing}
        />
        <label className={cn(
          "p-2 rounded-md hover:bg-accent cursor-pointer",
          "transition-colors duration-200",
          isProcessing && "opacity-50 cursor-not-allowed"
        )}>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            disabled={isProcessing}
          />
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
        </label>
        <button
          onClick={handleSend}
          disabled={isProcessing || (!input.trim() && !selectedImage)}
          className={cn(
            "p-2 rounded-md",
            "text-primary hover:bg-primary/10",
            "transition-colors duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}