import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useChatStore } from '../store/chatStore';
import { cn } from '@/lib/utils';

export function EmailDialog() {
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState('');
  const showEmailDialog = useChatStore(state => state.showEmailDialog);
  const setShowEmailDialog = useChatStore(state => state.setShowEmailDialog);
  const setEmail_Store = useChatStore(state => state.setEmail);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      await setEmail_Store(email);
      setShowEmailDialog(false);
    } catch (error) {
      setError('Failed to save email');
    }
  };

  const handleSkip = () => {
    setShowEmailDialog(false);
  };

  if (!showEmailDialog) return null;

  return (
    <div className="absolute inset-0 bg-white/95 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-gray-600 text-center">
            Would you like to receive a link to continue this conversation later?
          </p>
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            className={cn(
              "w-full",
              error ? 'border-red-500' : ''
            )}
          />
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>
        <div className="flex justify-center gap-3">
          <Button type="button" variant="outline" onClick={handleSkip} size="sm">
            Skip
          </Button>
          <Button type="submit" size="sm">
            Save Email
          </Button>
        </div>
      </form>
    </div>
  );
}