import { createContext, useState, useCallback } from 'react';

export const NotificationContext = createContext(null);

let id = 0;

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info', duration = 4000) => {
    const notificationId = ++id;
    setNotifications(prev => [...prev, { id: notificationId, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }, duration);
    }
    return notificationId;
  }, []);

  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  const success = useCallback((msg) => addNotification(msg, 'success'), [addNotification]);
  const error = useCallback((msg) => addNotification(msg, 'error', 6000), [addNotification]);
  const warn = useCallback((msg) => addNotification(msg, 'warning'), [addNotification]);
  const info = useCallback((msg) => addNotification(msg, 'info'), [addNotification]);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, success, error, warn, info }}>
      {children}
    </NotificationContext.Provider>
  );
}