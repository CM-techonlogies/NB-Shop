import { create } from 'zustand';
import { TRANSLATIONS } from '../constants/translations';

export const useLanguageStore = create((set, get) => ({
  language: localStorage.getItem('kirana_language') || 'en',
  
  setLanguage: (lang) => {
    localStorage.setItem('kirana_language', lang);
    set({ language: lang });
  },

  toggleLanguage: () => {
    const current = get().language;
    const next = current === 'en' ? 'hi' : 'en';
    localStorage.setItem('kirana_language', next);
    set({ language: next });
  },

  t: (key) => {
    const lang = get().language;
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en?.[key] || key;
  }
}));
