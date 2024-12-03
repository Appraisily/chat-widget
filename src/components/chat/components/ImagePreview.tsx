import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImagePreviewProps {
  image: File;
  onRemove: () => void;
  disabled?: boolean;
}

export function ImagePreview({ image, onRemove, disabled }: ImagePreviewProps) {
  return (
    <div className="relative inline-block">
      <img
        src={URL.createObjectURL(image)}
        alt="Preview"
        className="h-20 rounded-lg border border-border"
      />
      <button
        onClick={onRemove}
        className={cn(
          "absolute -top-2 -right-2 p-1 rounded-full",
          "bg-background border border-border shadow-sm",
          "hover:bg-accent transition-colors duration-200",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        disabled={disabled}
        type="button"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}