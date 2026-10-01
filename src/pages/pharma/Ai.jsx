import { useState, useEffect, useRef } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { sendAiMessage } from '../../api/pharma/ai';
import api from '../../api/axios';
import { Send, Trash2, Bot, Sparkles, TrendingUp, AlertTriangle, Package, Clock, Lightbulb } from 'lucide-react';

const suggestions = [
  { icon: TrendingUp, text: 'How are my sales today?', color: 'text-green-500' },
  { icon: AlertTriangle, text: 'Which medicines are expiring soon?', color: 'text-yellow-500' },
  { icon: Package, text: 'What do I need to reorder?', color: 'text-blue-500' },
  { icon: TrendingUp, text: 'Show me my monthly profit summary', color: 'text-purple-500' },
  { icon: Clock, text: 'Any pending prescriptions?', color: 'text-orange-500' },
  { icon: Lightbulb, text: 'Give me a business overview', color: 'text-teal-500' },
];

export default function Ai() {
  const { user } = useAuth();
  const { error } = useNotification();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    api.get('/public/ai-settings').then(res => setConfig(res?.data || res)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;
    if (!text) setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setSending(true);
    try {
      const res = await sendAiMessage(userMsg);
      const reply = res?.data?.reply || res?.reply || 'Sorry, I am unable to respond.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) { error('Failed to get response'); }
    setSending(false);
    inputRef.current?.focus();
  };

  const clearChat = () => setMessages([]);
  const greeting = `Hello ${user?.name?.split(' ')[0] || 'there'}! I'm your PharmaSys AI assistant. I can help you analyze sales, check inventory, track prescriptions, and more. How can I help you today?`;

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  if (!config?.clientAiEnabled) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <Bot size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Assistant Unavailable</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">The AI assistant is currently disabled by your administrator.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Assistant</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Powered by HDM AI</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={clearChat}><Trash2 size={16} /> Clear Chat</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Chat Area */}
        <Card className="lg:col-span-3 h-[650px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-purple-100 dark:from-primary-900/30 dark:to-purple-900/30 flex items-center justify-center mx-auto mb-4">
                  <Bot size={32} className="text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hello! I'm your AI assistant</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">{greeting}</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center mr-2 mt-1 shrink-0">
                      <Sparkles size={14} className="text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white rounded-br-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
                  }`}>
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center ml-2 mt-1 shrink-0">
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{(user?.name || 'U')[0]}</span>
                    </div>
                  )}
                </div>
              ))
            )}
            {sending && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center mr-2 shrink-0">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            <Input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} placeholder="Ask me anything about your pharmacy..." className="flex-1" />
            <Button type="submit" disabled={sending || !input.trim()}><Send size={18} /></Button>
          </form>
        </Card>

        {/* Suggestions Sidebar */}
        <Card className="lg:col-span-1 h-[650px] flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={18} className="text-yellow-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Suggestions</h3>
          </div>
          <div className="space-y-2 flex-1 overflow-y-auto">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s.text)}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-start gap-3"
              >
                <s.icon size={16} className={`${s.color} mt-0.5 shrink-0`} />
                <span className="text-sm text-gray-600 dark:text-gray-400">{s.text}</span>
              </button>
            ))}
          </div>
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700 mt-3">
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
              AI can make mistakes. Verify important information.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}