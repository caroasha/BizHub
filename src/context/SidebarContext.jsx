import { createContext, useState, useCallback } from 'react';

export const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [activeModule, setActiveModule] = useState(null);

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  const toggleCollapse = useCallback(() => setIsCollapsed(prev => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <SidebarContext.Provider value={{
      isOpen, isCollapsed, activeMenu, activeModule,
      toggle, toggleCollapse, close,
      setActiveMenu, setActiveModule, setIsOpen,
    }}>
      {children}
    </SidebarContext.Provider>
  );
}