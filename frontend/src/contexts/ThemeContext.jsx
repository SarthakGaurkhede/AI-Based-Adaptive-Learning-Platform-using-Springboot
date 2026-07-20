import React, { createContext, useContext, useEffect, useState } from 'react';
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  isDark: false
});
export const ThemeProvider = ({
  children
}) => {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('kg-theme');
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('kg-theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  return <ThemeContext.Provider value={{
    theme,
    toggleTheme,
    isDark: theme === 'dark'
  }}>
      {children}
    </ThemeContext.Provider>;
};
export const useTheme = () => useContext(ThemeContext);