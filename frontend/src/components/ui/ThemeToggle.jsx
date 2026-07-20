import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
const ThemeToggle = ({
  className = '',
  showLabel = false
}) => {
  const {
    theme,
    toggleTheme,
    isDark
  } = useTheme();
  return <button onClick={toggleTheme} aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`} className={`
        relative flex items-center gap-2 p-2 rounded-xl
        hover:bg-surface-container transition-colors duration-200
        text-on-surface-variant hover:text-primary
        ${className}
      `}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={theme} initial={{
        scale: 0.5,
        rotate: -90,
        opacity: 0
      }} animate={{
        scale: 1,
        rotate: 0,
        opacity: 1
      }} exit={{
        scale: 0.5,
        rotate: 90,
        opacity: 0
      }} transition={{
        duration: 0.2
      }} className="material-symbols-outlined text-[22px]">
          {isDark ? 'light_mode' : 'dark_mode'}
        </motion.span>
      </AnimatePresence>
      {showLabel && <span className="text-label-md font-medium hidden sm:block">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>}
    </button>;
};
export default ThemeToggle;