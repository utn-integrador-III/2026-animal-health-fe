import { translations } from '../i18n/translations';
import useLanguageStore from '../stores/useLanguageStore';

export default function useTranslation() {
  const language = useLanguageStore((state) => state.language);
  const dictionary = translations[language] ?? translations.en;

  const t = (key) => dictionary[key] ?? translations.en[key] ?? key;

  return { language, t };
}
