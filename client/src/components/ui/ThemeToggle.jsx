import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle({ className = '', showLabel = true }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs border cursor-pointer select-none active:scale-95 ${
        isDark
          ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <span className="text-sm">{isDark ? '☀️' : '🌙'}</span>
      {showLabel && (
        <span className="hidden sm:inline font-heading tracking-wide">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
}
