import { describe, expect, test } from 'vitest';

import { getHomeRouteByRole } from '../src/utils/roleRedirect.js';

describe('getHomeRouteByRole', () => {
  test('redirects client to client pets', () => {
    expect(getHomeRouteByRole('client')).toBe('/client/pets');
  });

  test('redirects veterinarian to vet dashboard', () => {
    expect(getHomeRouteByRole('veterinarian')).toBe('/vet/dashboard');
  });

  test('defaults unknown role to client pets', () => {
    expect(getHomeRouteByRole('unknown')).toBe('/client/pets');
  });
});
