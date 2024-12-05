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
  containerId?: string;
}

class Widget {
  private container: HTMLElement | null = null;
  private root: ReturnType<typeof createRoot> | null = null;
  private config: WidgetConfig = {
    position: 'bottom-right',
    primaryColor: '#007bff',
    containerId: 'appraisily-chat-widget-container'
  };

  init = (config?: WidgetConfig) => {
    if (this.container) {
      console.warn('Chat widget already initialized');
      return;
    }

    // Merge configurations
    this.config = { ...this.config, ...config };

    // Use existing container or create new one
    this.container = document.getElementById(this.config.containerId || '') || 
      document.createElement('div');
    
    if (!this.container.parentNode) {
      document.body.appendChild(this.container);
    }

    // Create style element
    const style = document.createElement('style');
    style.textContent = `
      #${this.container.id} {
        position: fixed;
        z-index: 2147483647;
        ${this.config.position === 'bottom-right' ? 'right: 20px;' : 'left: 20px;'}
        bottom: 20px;
      }

      @media (max-width: 768px) {
        #${this.container.id} {
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