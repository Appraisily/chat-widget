import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChatWidget } from '@/components/chat';

declare global {
  interface Window {
    AppraisilyChatWidget?: {
      init: (config?: WidgetConfig) => void;
      destroy: () => void;
    };
  }
}

interface WidgetConfig {
  position?: 'bottom-right' | 'bottom-left';
  primaryColor?: string;
}

class Widget {
  private container: HTMLElement | null = null;
  private root: ReturnType<typeof createRoot> | null = null;
  private config: WidgetConfig = {
    position: 'bottom-right',
    primaryColor: '#007bff'
  };

  init = (config?: WidgetConfig) => {
    if (this.container) {
      console.warn('Chat widget already initialized');
      return;
    }

    // Merge configurations
    this.config = { ...this.config, ...config };

    // Create container
    this.container = document.createElement('div');
    this.container.id = 'appraisily-chat-widget';
    document.body.appendChild(this.container);

    // Create style element
    const style = document.createElement('style');
    style.textContent = `
      #appraisily-chat-widget {
        position: fixed;
        z-index: 2147483647;
        ${this.config.position === 'bottom-right' ? 'right: 20px;' : 'left: 20px;'}
        bottom: 20px;
      }

      @media (max-width: 768px) {
        #appraisily-chat-widget {
          right: 10px;
          bottom: 10px;
        }
      }
    `;
    document.head.appendChild(style);

    // Mount React component
    this.root = createRoot(this.container);
    this.root.render(
      <React.StrictMode>
        <ChatWidget />
      </React.StrictMode>
    );
  };

  destroy = () => {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
      this.container = null;
    }
  };
}

// Initialize global widget object
const widget = new Widget();
window.AppraisilyChatWidget = {
  init: widget.init,
  destroy: widget.destroy
};