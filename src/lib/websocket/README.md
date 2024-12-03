# WebSocket System Documentation

## Architecture Overview

The WebSocket system is organized into modular components for better maintainability and separation of concerns:

```
websocket/
├── core/
│   ├── WebSocketBase.ts       # Base abstract class for WebSocket functionality
│   ├── ConnectionManager.ts   # Handles connection lifecycle and reconnection
│   ├── HeartbeatManager.ts   # Manages heartbeat mechanism
│   └── MessageHandler.ts     # Processes incoming/outgoing messages
├── context.tsx               # React context for WebSocket state
├── connection.ts            # Main WebSocket orchestrator
├── messageQueue.ts          # Message queueing and retry system
├── types.ts                # TypeScript interfaces and types
└── README.md               # This documentation
```

## Connection Protocol

### Initial Connection

1. Client initiates WebSocket connection
2. Upon successful WebSocket connection, client sends handshake:
```typescript
{
  type: 'connect',
  clientId: string,      // Unique client identifier
  timestamp: string,     // ISO timestamp
  version: string        // Protocol version
}
```

3. Server responds with confirmation:
```typescript
{
  type: 'connect_confirm',
  clientId: string,         // Echo of client ID
  conversationId: string,   // New conversation session ID
  status: 'confirmed',      // Connection status
  timestamp: string         // ISO timestamp
}
```

### Connection States

1. **CONNECTING**
   - Initial WebSocket connection attempt
   - No messages can be sent
   - Connection timeout may occur

2. **PENDING**
   - WebSocket connected
   - Waiting for handshake confirmation
   - Messages are queued

3. **CONFIRMED**
   - Handshake completed
   - Full bidirectional communication
   - Heartbeat active

4. **DISCONNECTED**
   - Connection lost or closed
   - Automatic reconnection may trigger
   - Messages are queued

### Heartbeat Protocol

1. Client sends heartbeat:
```typescript
{
  type: 'ping',
  timestamp: string
}
```

2. Server responds:
```typescript
{
  type: 'pong',
  timestamp: string
}
```

- Interval: 30 seconds
- Timeout: 2 * interval
- Missing responses trigger reconnection

### Message Protocol

#### Client to Server
```typescript
{
  type: 'message',
  clientId: string,      // Client identifier
  content: string,       // Message content
  timestamp: string,     // ISO timestamp
  messageId: string      // Unique message ID
}
```

#### Server to Client
```typescript
{
  type: 'response',
  messageId: string,     // Original message ID
  content: string,       // Response content
  timestamp: string      // ISO timestamp
}
```

### Error Handling

1. Connection Errors
```typescript
{
  type: 'error',
  error: string,         // Error description
  timestamp: string      // ISO timestamp
}
```

2. Reconnection Strategy
   - Maximum 5 attempts
   - Exponential backoff
   - 1s, 2s, 4s, 8s, 16s intervals

## State Management

### Connection State
```typescript
interface ConnectionState {
  status: 'disconnected' | 'connecting' | 'connected';
  clientId: string | null;
  conversationId: string | null;
  error: string | null;
}
```

### Message Queue
- Messages are queued when:
  1. Connection is not established
  2. Handshake is incomplete
  3. Previous send attempt failed
- Queue is processed when connection is confirmed
- Messages persist across reconnections

## Usage Example

```typescript
// Initialize connection
const ws = new WebSocketConnection(handleStateChange);

// Connect and handle handshake
await ws.connect();

// Send message
ws.send({
  type: 'message',
  content: 'Hello!',
  timestamp: new Date().toISOString()
});

// Handle incoming messages
function handleStateChange(state: ConnectionState) {
  console.log('Connection state:', state);
}
```

## Best Practices

1. **Connection Management**
   - Always wait for connection confirmation
   - Handle disconnections gracefully
   - Implement proper cleanup

2. **Message Handling**
   - Include all required message fields
   - Validate incoming messages
   - Handle message timeouts

3. **Error Handling**
   - Implement proper error recovery
   - Log connection issues
   - Notify users of problems

4. **State Management**
   - Track connection state
   - Maintain message queue
   - Handle reconnection properly

## Security Considerations

1. **Message Validation**
   - Validate all incoming messages
   - Sanitize message content
   - Check message types

2. **Connection Security**
   - Use secure WebSocket (wss://)
   - Validate client IDs
   - Implement rate limiting

3. **Error Handling**
   - Don't expose sensitive info
   - Log security events
   - Handle malformed messages