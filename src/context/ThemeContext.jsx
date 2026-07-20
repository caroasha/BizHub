import { createContext, useState, useEffect, useCallback } from 'react';

export const ThemeContext = createContext(null);

const defaultColors = {
  primary: '#1a73e8',
  secondary: '#0d9488',
  accent: '#f59e0b',
};

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('theme') || 'light');
  const [colors, setColors] = useState(defaultColors);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
    localStorage.setItem('theme', mode);
  }, [mode]);

  const toggleMode = useCallback(() => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const isDark = mode === 'dark';

  return (
    <ThemeContext.Provider value={{ mode, colors, isDark, toggleMode, setMode, setColors }}>
      {children}
    </ThemeContext.Provider>
  );
}