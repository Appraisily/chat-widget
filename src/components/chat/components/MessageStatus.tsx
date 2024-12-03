import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageStatusProps {
  status: {
    sent: boolean;
    received: boolean;
    processed: boolean;
  };
  className?: string;
}

export function MessageStatus({ status, className }: MessageStatusProps) {
  if (!status.sent) return null;

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      <Check 
        className={cn(
          "h-3 w-3",
          status.received ? "text-blue-500" : "text-gray-400"
        )} 
      />
      {status.received && (
        <Check 
          className={cn(
            "h-3 w-3 -ml-1.5",
            status.processed ? "text-blue-500" : "text-gray-400"
          )} 
        />
      )}
    </div>
  );
}