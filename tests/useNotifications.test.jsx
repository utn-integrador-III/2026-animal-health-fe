import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useNotifications } from '../src/hooks/useNotifications';
import * as notificationService from '../src/services/notificationService';

vi.mock('../src/services/notificationService');

describe('useNotifications hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    notificationService.getUserNotifications.mockResolvedValue({
      notifications: [{ id: 'n1', read: false }, { id: 'n2', read: true }],
      total: 2,
      unread_count: 1,
    });
    notificationService.getUnreadCount.mockResolvedValue(1);
  });

  test('loads notifications and unread count on mount', async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.notifications).toHaveLength(2);
    expect(result.current.unreadCount).toBe(1);
    expect(result.current.total).toBe(2);
  });

  test('handles loadNotifications error', async () => {
    notificationService.getUserNotifications.mockRejectedValueOnce(new Error('Failed to load'));
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to load');
  });

  test('markAsRead updates notification read state and decrements unreadCount', async () => {
    notificationService.markAsRead.mockResolvedValueOnce({ success: true });
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.markAsRead('n1');
    });

    expect(result.current.notifications[0].read).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  test('markAsRead throws and logs on error', async () => {
    notificationService.markAsRead.mockRejectedValueOnce(new Error('Read error'));
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(
      act(async () => {
        await result.current.markAsRead('n1');
      })
    ).rejects.toThrow('Read error');
  });

  test('markAllAsRead sets all notifications as read and resets unreadCount to 0', async () => {
    notificationService.markAllAsRead.mockResolvedValueOnce({ success: true });
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.markAllAsRead();
    });

    expect(result.current.notifications.every((n) => n.read)).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  test('markAllAsRead throws on error', async () => {
    notificationService.markAllAsRead.mockRejectedValueOnce(new Error('All read error'));
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(
      act(async () => {
        await result.current.markAllAsRead();
      })
    ).rejects.toThrow('All read error');
  });

  test('deleteNotification removes notification and decrements unreadCount if deleted was unread', async () => {
    notificationService.deleteNotification.mockResolvedValueOnce({ success: true });
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteNotification('n1');
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.unreadCount).toBe(0);
  });

  test('deleteNotification throws on error', async () => {
    notificationService.deleteNotification.mockRejectedValueOnce(new Error('Delete error'));
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(
      act(async () => {
        await result.current.deleteNotification('n1');
      })
    ).rejects.toThrow('Delete error');
  });

  test('takeMedication removes notification and decrements unreadCount', async () => {
    notificationService.takeMedication.mockResolvedValueOnce({ success: true });
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.takeMedication('n1');
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.unreadCount).toBe(0);
  });

  test('takeMedication throws on error', async () => {
    notificationService.takeMedication.mockRejectedValueOnce(new Error('Take error'));
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(
      act(async () => {
        await result.current.takeMedication('n1');
      })
    ).rejects.toThrow('Take error');
  });

  test('remindLater removes notification and returns result', async () => {
    notificationService.remindLater.mockResolvedValueOnce({ message: 'Snoozed' });
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.loading).toBe(false));

    let res;
    await act(async () => {
      res = await result.current.remindLater('n1', 20);
    });

    expect(res).toEqual({ message: 'Snoozed' });
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.unreadCount).toBe(0);
  });

  test('remindLater throws on error', async () => {
    notificationService.remindLater.mockRejectedValueOnce(new Error('Snooze error'));
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(
      act(async () => {
        await result.current.remindLater('n1');
      })
    ).rejects.toThrow('Snooze error');
  });
});
