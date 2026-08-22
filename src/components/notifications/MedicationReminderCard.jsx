// src/components/notifications/MedicationReminderCard.jsx

import { useState } from 'react';
import { HiCheckCircle, HiClock, HiBell } from 'react-icons/hi';
import { HiXMark } from 'react-icons/hi2';

/**
 * MedicationReminderCard
 *
 * Displays a full medication reminder notification card with:
 * - Medication name, dosage, scheduled time, and pet name
 * - "Mark as Taken" and "Remind Me Later" action buttons
 * - Success animation on marking as taken
 *
 * @param {object} notification - Notification object from the backend
 * @param {function} onTake     - Async handler: marks medication as taken
 * @param {function} onSnooze   - Async handler: snoozes the notification
 * @param {function} onDismiss  - Optional: removes card from UI without API call
 */
export default function MedicationReminderCard({ notification, onTake, onSnooze, onDismiss }) {
  const [takenState, setTakenState] = useState('idle'); // idle | loading | success
  const [snoozeState, setSnoozeState] = useState('idle'); // idle | loading | done

  const {
    id,
    medication_name,
    medication_dosage,
    medication_time,
    pet_name,
    title,
    message,
  } = notification;

  const displayName = medication_name || title || 'Medicamento';
  const displayDosage = medication_dosage || '—';
  const displayTime = medication_time || '—';
  const displayPet = pet_name || null;

  const handleTake = async () => {
    if (takenState !== 'idle') return;
    setTakenState('loading');
    try {
      await onTake(id);
      setTakenState('success');
    } catch {
      setTakenState('idle');
    }
  };

  const handleSnooze = async () => {
    if (snoozeState !== 'idle') return;
    setSnoozeState('loading');
    try {
      await onSnooze(id, 15);
      setSnoozeState('done');
    } catch {
      setSnoozeState('idle');
    }
  };

  // Success overlay
  if (takenState === 'success') {
    return (
      <div className="med-reminder-card med-reminder-card--success" role="status" aria-live="polite">
        <div className="med-reminder-success-inner">
          <HiCheckCircle className="med-reminder-success-icon" aria-hidden="true" />
          <p className="med-reminder-success-title">¡Tomado!</p>
          <p className="med-reminder-success-sub">
            {displayPet
              ? `${displayPet} recibió ${displayName} correctamente.`
              : `${displayName} registrado correctamente.`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <article
      className="med-reminder-card"
      aria-label={`Recordatorio de medicación: ${displayName}`}
    >
      {/* Dismiss button */}
      {onDismiss && (
        <button
          onClick={() => onDismiss(id)}
          className="med-reminder-dismiss"
          aria-label="Cerrar recordatorio"
        >
          <HiXMark />
        </button>
      )}

      {/* Header */}
      <div className="med-reminder-header">
        <div className="med-reminder-pill-icon" aria-hidden="true">💊</div>
        <div>
          {displayPet && (
            <p className="med-reminder-pet-label">
              🐾 {displayPet}
            </p>
          )}
          <p className="med-reminder-alert-text">
            {message || 'Es hora de administrar el medicamento'}
          </p>
        </div>
      </div>

      {/* Medication details */}
      <div className="med-reminder-details">
        <div className="med-reminder-detail-row">
          <span className="med-reminder-detail-icon" aria-hidden="true">💊</span>
          <div>
            <p className="med-reminder-detail-label">Medicamento</p>
            <p className="med-reminder-detail-value">{displayName}</p>
          </div>
        </div>

        <div className="med-reminder-detail-row">
          <span className="med-reminder-detail-icon" aria-hidden="true">⚖️</span>
          <div>
            <p className="med-reminder-detail-label">Dosis</p>
            <p className="med-reminder-detail-value">{displayDosage}</p>
          </div>
        </div>

        <div className="med-reminder-detail-row">
          <HiClock className="med-reminder-detail-icon text-blue-400" aria-hidden="true" />
          <div>
            <p className="med-reminder-detail-label">Hora programada</p>
            <p className="med-reminder-detail-value">{displayTime}</p>
          </div>
        </div>
      </div>

      {/* Scheduler badge */}
      <div className="med-reminder-scheduler-badge" aria-label="Gestionado automáticamente">
        <HiBell className="inline mr-1" aria-hidden="true" />
        Gestionado automáticamente por el planificador
      </div>

      {/* Action buttons */}
      <div className="med-reminder-actions">
        <button
          id={`take-btn-${id}`}
          onClick={handleTake}
          disabled={takenState !== 'idle'}
          className="med-reminder-btn-take"
          aria-busy={takenState === 'loading'}
        >
          {takenState === 'loading' ? (
            <span className="med-reminder-spinner" aria-hidden="true" />
          ) : (
            <HiCheckCircle aria-hidden="true" />
          )}
          Marcar como Tomado
        </button>

        <button
          id={`snooze-btn-${id}`}
          onClick={handleSnooze}
          disabled={snoozeState !== 'idle'}
          className="med-reminder-btn-snooze"
          aria-busy={snoozeState === 'loading'}
        >
          {snoozeState === 'loading'
            ? 'Posponiendo...'
            : snoozeState === 'done'
            ? '✓ Pospuesto 15 min'
            : '⏰ Recordar más tarde'}
        </button>
      </div>
    </article>
  );
}
