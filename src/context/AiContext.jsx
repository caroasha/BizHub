import { createContext, useState, useCallback, useEffect } from 'react';
import { getAiSettings, sendAiMessage } from '../api/public/landing';

export const AiContext = createContext(null);

export function AiProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [config, setConfig] = useState({
    color: '#1a73e8',
    position: 'bottom-right',
    aiName: 'BizHub Assistant',
    defaultGreeting: 'Hello! How can I help you today?',
    enabled: false,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    getAiSettings()
      .then(res => {
        const data = res?.data || res || {};
        setConfig({
          color: data.color || '#1a73e8',
          position: data.position || 'bottom-right',
          aiName: data.aiName || 'BizHub Assistant',
          defaultGreeting: data.defaultGreeting || 'Hello! How can I help you today?',
          enabled: data.landingAiEnabled || false,
        });
      })
      .catch(() => {});
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => {
      if (!prev && messages.length === 0) {
        setMessages([{ role: 'assistant', content: config.defaultGreeting }]);
      }
      return !prev;
    });
  }, [messages.length, config.defaultGreeting]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsTyping(true);
    setError(null);
    try {
      const res = await sendAiMessage(text);
      const reply = res?.data?.reply || res?.reply || 'Sorry, I am unable to respond.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError('Failed to send message');
    } finally {
      setIsTyping(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([{ role: 'assistant', content: config.defaultGreeting }]);
  }, [config.defaultGreeting]);

  return (
    <AiContext.Provider value={{ isOpen, messages, isTyping, config, error, toggle, sendMessage, clearMessages }}>
      {children}
    </AiContext.Provider>
  );
}