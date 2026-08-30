import { describe, expect, test } from 'vitest';
import { getApiErrorMessage } from '../src/services/apiError';

describe('getApiErrorMessage', () => {
  test('returns joined messages when detail is an array of error objects', () => {
    const error = {
      response: {
        data: {
          detail: [{ msg: 'Field is required.' }, { msg: 'Must be positive.' }],
        },
      },
    };

    const message = getApiErrorMessage(error);
    expect(message).toBe('Field is required. Must be positive.');
  });

  test('returns detail string when detail is a string', () => {
    const error = {
      response: {
        data: {
          detail: 'Unauthorized access',
        },
      },
    };

    const message = getApiErrorMessage(error);
    expect(message).toBe('Unauthorized access');
  });

  test('returns fallback message when detail is missing or empty', () => {
    expect(getApiErrorMessage(null, 'Fallback error')).toBe('Fallback error');
    expect(getApiErrorMessage({}, 'Default error')).toBe('Default error');
    expect(getApiErrorMessage({ response: { data: {} } }, 'Custom fallback')).toBe('Custom fallback');
  });
});
