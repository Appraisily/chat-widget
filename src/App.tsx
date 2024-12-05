import { ChatWidget } from '@/components/chat';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Chat Widget Demo
        </h1>
        <p className="text-gray-600">
          Click the chat button in the bottom right corner
        </p>
      </div>
      <ChatWidget />
    </div>
  );
}