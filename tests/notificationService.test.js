// tests/notificationService.test.js
// Unit tests for takeMedication and remindLater functions
// Uses global fetch mock — no real HTTP calls are made

import { beforeEach, afterEach, describe, expect, test, vi } from 'vitest';
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  takeMedication,
  remindLater,
} from '../src/services/notificationService';

const mockToken = 'test-jwt-token';
const mockFetch = vi.fn();

// Assign fetch before each test so setup.js's localStorage.clear() still works
globalThis.fetch = mockFetch;

const NOTIF_ID = 'notif-xyz-789';

describe('notificationService — medication actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set the token so getAuthToken() returns it
    localStorage.setItem('access_token', mockToken);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── takeMedication ──────────────────────────────────────────────────
  describe('takeMedication', () => {
    test('calls PUT /api/notifications/{id}/take with Authorization header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Medication marked as taken and notification read' }),
      });

      const result = await takeMedication(NOTIF_ID);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain(`/api/notifications/${NOTIF_ID}/take`);
      expect(options.method).toBe('PUT');
      expect(options.headers['Authorization']).toBe(`Bearer ${mockToken}`);
      expect(result.message).toMatch(/taken/i);
    });

    test('throws an error when the server responds with a non-ok status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(takeMedication(NOTIF_ID)).rejects.toThrow('Error 404: Not Found');
    });

    test('throws when the network request fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(takeMedication(NOTIF_ID)).rejects.toThrow('Network error');
    });
  });

  // ── remindLater ─────────────────────────────────────────────────────
  describe('remindLater', () => {
    test('calls PUT /api/notifications/{id}/remind-later with default 15 minutes', async () => {
      const remindAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Remind later scheduled in 15 minutes', remind_at: remindAt }),
      });

      const result = await remindLater(NOTIF_ID);

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain(`/api/notifications/${NOTIF_ID}/remind-later?delay_minutes=15`);
      expect(options.method).toBe('PUT');
      expect(result.message).toMatch(/15 minutes/i);
    });

    test('calls the endpoint with a custom delay when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Remind later scheduled in 30 minutes' }),
      });

      await remindLater(NOTIF_ID, 30);

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('delay_minutes=30');
    });

    test('throws an error when the server responds with 403', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      });

      await expect(remindLater(NOTIF_ID)).rejects.toThrow('Error 403: Forbidden');
    });
  });

  // ── getUserNotifications ─────────────────────────────────────────────
  describe('getUserNotifications', () => {
    test('fetches notifications with query params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ notifications: [{ id: 'n1' }], total: 1, unread_count: 1 }),
      });

      const data = await getUserNotifications(true, 10, 5);
      const [url] = mockFetch.mock.calls[0];

      expect(url).toContain('/api/notifications/?only_unread=true&limit=10&offset=5');
      expect(data.notifications).toHaveLength(1);
    });

    test('throws when server returns error status', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Server Error' });
      await expect(getUserNotifications()).rejects.toThrow('Error 500: Server Error');
    });
  });

  // ── getUnreadCount ───────────────────────────────────────────────────
  describe('getUnreadCount', () => {
    test('returns unread count on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ unread_count: 5 }),
      });

      const count = await getUnreadCount();
      expect(count).toBe(5);
    });

    test('returns 0 on error response', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 400 });
      const count = await getUnreadCount();
      expect(count).toBe(0);
    });
  });

  // ── markAsRead ───────────────────────────────────────────────────────
  describe('markAsRead', () => {
    test('calls PUT /api/notifications/{id}/read', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await markAsRead('n1');
      const [url, options] = mockFetch.mock.calls[0];

      expect(url).toContain('/api/notifications/n1/read');
      expect(options.method).toBe('PUT');
      expect(result.success).toBe(true);
    });

    test('throws when server returns error', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404, statusText: 'Not Found' });
      await expect(markAsRead('n1')).rejects.toThrow('Error 404: Not Found');
    });
  });

  // ── markAllAsRead ────────────────────────────────────────────────────
  describe('markAllAsRead', () => {
    test('calls PUT /api/notifications/read-all', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await markAllAsRead();
      const [url, options] = mockFetch.mock.calls[0];

      expect(url).toContain('/api/notifications/read-all');
      expect(options.method).toBe('PUT');
      expect(result.success).toBe(true);
    });

    test('throws when server returns error', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Error' });
      await expect(markAllAsRead()).rejects.toThrow('Error 500: Error');
    });
  });

  // ── deleteNotification ───────────────────────────────────────────────
  describe('deleteNotification', () => {
    test('calls DELETE /api/notifications/{id}', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await deleteNotification('n1');
      const [url, options] = mockFetch.mock.calls[0];

      expect(url).toContain('/api/notifications/n1');
      expect(options.method).toBe('DELETE');
      expect(result.success).toBe(true);
    });

    test('throws when server returns error', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404, statusText: 'Not Found' });
      await expect(deleteNotification('n1')).rejects.toThrow('Error 404: Not Found');
    });
  });
});
