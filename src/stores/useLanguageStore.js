import { create } from 'zustand';

import { LANGUAGES } from '../i18n/translations';

const STORAGE_KEY = 'animal_health_language';

function getInitialLanguage() {
  const storedLanguage = localStorage.getItem(STORAGE_KEY);
  if (storedLanguage === LANGUAGES.ES || storedLanguage === LANGUAGES.EN) {
    return storedLanguage;
  }
  return LANGUAGES.EN;
}

const useLanguageStore = create((set) => ({
  language: getInitialLanguage(),
  setLanguage: (language) => {
    localStorage.setItem(STORAGE_KEY, language);
    set({ language });
  },
}));

export default useLanguageStore;
