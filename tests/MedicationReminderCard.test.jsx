// tests/MedicationReminderCard.test.jsx
// Unit tests for the MedicationReminderCard component

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import MedicationReminderCard from '../src/components/notifications/MedicationReminderCard';

const MOCK_NOTIFICATION = {
  id: 'notif-001',
  medication_name: 'Desparasitante',
  medication_dosage: '1.5 tabletas',
  medication_time: '13:45',
  pet_name: 'Luna',
  message: 'Es hora de administrar el medicamento a tu mascota.',
  read: false,
};

const MOCK_NOTIFICATION_MINIMAL = {
  id: 'notif-002',
  title: 'Recordatorio de medicación',
  read: false,
};

describe('MedicationReminderCard', () => {
  let onTake;
  let onSnooze;
  let onDismiss;

  beforeEach(() => {
    onTake = vi.fn().mockResolvedValue(undefined);
    onSnooze = vi.fn().mockResolvedValue({ message: 'Remind later scheduled in 15 minutes' });
    onDismiss = vi.fn();
  });

  // ── Rendering ─────────────────────────────────────────────────────
  describe('rendering', () => {
    test('displays medication name, dosage, time, and pet name', () => {
      render(
        <MedicationReminderCard
          notification={MOCK_NOTIFICATION}
          onTake={onTake}
          onSnooze={onSnooze}
        />
      );

      expect(screen.getByText('Desparasitante')).toBeInTheDocument();
      expect(screen.getByText('1.5 tabletas')).toBeInTheDocument();
      expect(screen.getByText('13:45')).toBeInTheDocument();
      expect(screen.getByText(/Luna/)).toBeInTheDocument();
    });

    test('displays the reminder message', () => {
      render(
        <MedicationReminderCard
          notification={MOCK_NOTIFICATION}
          onTake={onTake}
          onSnooze={onSnooze}
        />
      );

      expect(screen.getByText(/Es hora de administrar/i)).toBeInTheDocument();
    });

    test('shows scheduler badge', () => {
      render(
        <MedicationReminderCard
          notification={MOCK_NOTIFICATION}
          onTake={onTake}
          onSnooze={onSnooze}
        />
      );

      expect(screen.getByText(/planificador/i)).toBeInTheDocument();
    });

    test('renders with minimal notification data using fallbacks', () => {
      render(
        <MedicationReminderCard
          notification={MOCK_NOTIFICATION_MINIMAL}
          onTake={onTake}
          onSnooze={onSnooze}
        />
      );

      expect(screen.getByText('Recordatorio de medicación')).toBeInTheDocument();
      // Dosage and time should show dashes
      expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2);
    });

    test('shows dismiss button when onDismiss is provided', () => {
      render(
        <MedicationReminderCard
          notification={MOCK_NOTIFICATION}
          onTake={onTake}
          onSnooze={onSnooze}
          onDismiss={onDismiss}
        />
      );

      expect(screen.getByRole('button', { name: /cerrar recordatorio/i })).toBeInTheDocument();
    });

    test('does not show dismiss button when onDismiss is not provided', () => {
      render(
        <MedicationReminderCard
          notification={MOCK_NOTIFICATION}
          onTake={onTake}
          onSnooze={onSnooze}
        />
      );

      expect(screen.queryByRole('button', { name: /cerrar recordatorio/i })).not.toBeInTheDocument();
    });
  });

  // ── Actions ───────────────────────────────────────────────────────
  describe('actions', () => {
    test('"Marcar como Tomado" calls onTake with the notification id', async () => {
      const user = userEvent.setup();
      render(
        <MedicationReminderCard
          notification={MOCK_NOTIFICATION}
          onTake={onTake}
          onSnooze={onSnooze}
        />
      );

      await user.click(screen.getByRole('button', { name: /marcar como tomado/i }));

      expect(onTake).toHaveBeenCalledWith('notif-001');
    });

    test('shows success state after marking as taken', async () => {
      const user = userEvent.setup();
      render(
        <MedicationReminderCard
          notification={MOCK_NOTIFICATION}
          onTake={onTake}
          onSnooze={onSnooze}
        />
      );

      await user.click(screen.getByRole('button', { name: /marcar como tomado/i }));

      await waitFor(() => {
        expect(screen.getByText('¡Tomado!')).toBeInTheDocument();
        expect(screen.getByText(/Luna recibió Desparasitante correctamente/i)).toBeInTheDocument();
      });
    });

    test('"Recordar más tarde" calls onSnooze with id and 15 minutes', async () => {
      const user = userEvent.setup();
      render(
        <MedicationReminderCard
          notification={MOCK_NOTIFICATION}
          onTake={onTake}
          onSnooze={onSnooze}
        />
      );

      await user.click(screen.getByRole('button', { name: /recordar más tarde/i }));

      expect(onSnooze).toHaveBeenCalledWith('notif-001', 15);
    });

    test('shows "Pospuesto" text after snoozing', async () => {
      const user = userEvent.setup();
      render(
        <MedicationReminderCard
          notification={MOCK_NOTIFICATION}
          onTake={onTake}
          onSnooze={onSnooze}
        />
      );

      await user.click(screen.getByRole('button', { name: /recordar más tarde/i }));

      await waitFor(() => {
        expect(screen.getByText(/pospuesto 15 min/i)).toBeInTheDocument();
      });
    });

    test('dismiss button calls onDismiss with the notification id', async () => {
      const user = userEvent.setup();
      render(
        <MedicationReminderCard
          notification={MOCK_NOTIFICATION}
          onTake={onTake}
          onSnooze={onSnooze}
          onDismiss={onDismiss}
        />
      );

      await user.click(screen.getByRole('button', { name: /cerrar recordatorio/i }));

      expect(onDismiss).toHaveBeenCalledWith('notif-001');
    });
  });
});
