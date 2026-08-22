import { beforeEach, describe, expect, test, vi } from 'vitest';
import useLanguageStore from '../src/stores/useLanguageStore';

describe('useLanguageStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('setLanguage updates state and localStorage with new language', () => {
    useLanguageStore.getState().setLanguage('es');

    expect(useLanguageStore.getState().language).toBe('es');
    expect(localStorage.getItem('animal_health_language')).toBe('es');

    useLanguageStore.getState().setLanguage('en');

    expect(useLanguageStore.getState().language).toBe('en');
    expect(localStorage.getItem('animal_health_language')).toBe('en');
  });

  test('getInitialLanguage reads stored language from localStorage when valid (es or en)', async () => {
    localStorage.setItem('animal_health_language', 'es');
    vi.resetModules();
    const { default: freshLangStore } = await import('../src/stores/useLanguageStore');
    expect(freshLangStore.getState().language).toBe('es');
  });

  test('getInitialLanguage falls back to en when stored language is invalid or missing', async () => {
    localStorage.setItem('animal_health_language', 'invalid_lang');
    vi.resetModules();
    const { default: freshLangStore } = await import('../src/stores/useLanguageStore');
    expect(freshLangStore.getState().language).toBe('en');
  });
});
