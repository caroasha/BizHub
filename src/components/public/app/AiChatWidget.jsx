import { useState, useRef, useEffect } from 'react';
import { useAi } from '../../../hooks/useAi';
import { X, Trash2, MessageCircle } from 'lucide-react';
import { Button } from '../../ui/Button';

export function AiChatWidget() {
  const { isOpen, messages, isTyping, config, toggle, sendMessage, clearMessages } = useAi();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!config.enabled) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button onClick={toggle} className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95"
          style={{ backgroundColor: config.color || '#1a73e8' }}>
          <MessageCircle size={24} />
        </button>
      )}

      {isOpen && (
        <div className="w-80 sm:w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: '480px' }}>
          
          <div className="flex items-center justify-between px-4 py-3 text-white" style={{ backgroundColor: config.color || '#1a73e8' }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                {config.aiName?.[0] || 'B'}
              </div>
              <div>
                <p className="font-medium text-sm">{config.aiName || 'BizHub Assistant'}</p>
                <p className="text-xs text-white/70">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={clearMessages} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors" title="Clear chat">
                <Trash2 size={16} />
              </button>
              <button onClick={toggle} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900 min-h-[250px]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'text-white rounded-br-md'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-md'
                }`} style={msg.role === 'user' ? { backgroundColor: config.color || '#1a73e8' } : {}}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..."
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400 dark:placeholder-gray-500" />
            <Button type="submit" size="sm" disabled={isTyping} style={{ backgroundColor: config.color || '#1a73e8' }}>Send</Button>
          </form>
        </div>
      )}
    </div>
  );
}