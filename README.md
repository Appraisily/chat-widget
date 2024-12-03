# Appraisily Chat System

## Project Structure

```
src/
├── lib/
│   ├── constants/
│   │   └── websocket.ts       # WebSocket-related constants
│   ├── websocket/
│   │   ├── connection.ts      # WebSocket connection management
│   │   ├── context.tsx        # React context for WebSocket
│   │   ├── messageHandler.ts  # Message processing logic
│   │   ├── messageQueue.ts    # Message queueing system
│   │   ├── types.ts          # WebSocket types and interfaces
│   │   └── index.ts          # Public API exports
│   └── utils/
│       └── storage.ts         # Local storage utilities
├── components/
│   ├── chat/
│   │   ├── components/       # UI components
│   │   ├── hooks/           # React hooks
│   │   ├── store/           # State management
│   │   └── index.ts         # Public exports
│   └── ui/                  # Shared UI components
└── pages/
    └── chat/               # Chat page components
```

## WebSocket System

### Connection Management

The WebSocket connection system provides:

- Automatic connection/reconnection handling
- Connection state management
- Heartbeat mechanism
- Error handling and recovery

### Message Queue System

Handles message delivery with:

- Message tracking and confirmation
- Automatic retries (up to 3 attempts)
- 5-second timeout for unconfirmed messages
- Queue cleanup on disconnect

### State Management

Manages:

- Connection status
- Client/Conversation IDs
- Message history
- Error states

## Usage

```tsx
// In your app
import { WebSocketProvider } from '@/lib/websocket';

function App() {
  return (
    <WebSocketProvider>
      <Chat />
    </WebSocketProvider>
  );
}

// In components
import { useWebSocket } from '@/lib/websocket';

function Chat() {
  const { connectionState, send } = useWebSocket();
  
  // Use WebSocket functionality
}
```

## Message Types

### Client -> Server

```typescript
// Connect
{
  type: 'connect',
  clientId: string,
  timestamp: string,
  version: string
}

// Message
{
  type: 'message',
  content: string,
  clientId: string,
  messageId: string,
  timestamp: string
}

// Heartbeat
{
  type: 'ping',
  clientId: string,
  timestamp: string
}
```

### Server -> Client

```typescript
// Connection Confirmation
{
  type: 'connect_confirm',
  conversationId: string,
  status: 'success' | 'error'
}

// Message Response
{
  type: 'response',
  messageId: string,
  reply: string,
  timestamp: string
}

// Message Confirmation
{
  type: 'confirm',
  messageId: string
}
```

## Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

## Testing

Run tests:
```bash
npm test
```

## Error Handling

The system handles:

- Connection failures
- Message delivery failures
- Invalid message formats
- Timeout scenarios
- Network disconnections

## Best Practices

1. Always use the WebSocket context provider at the app root
2. Handle connection state changes appropriately
3. Implement proper error handling
4. Clean up resources on component unmount
5. Use message confirmation system
6. Monitor message queue for unconfirmed messages