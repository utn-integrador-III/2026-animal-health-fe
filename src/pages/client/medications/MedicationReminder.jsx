// src/pages/client/medications/MedicationReminder.jsx
// Pantalla de Recordatorios de Medicación
// Muestra alertas activas + tabla de calendario de medicación desde la BD

import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { HiBell, HiCalendar, HiCheckCircle, HiClock } from 'react-icons/hi';
import Swal from 'sweetalert2';

import { ROUTES } from '../../../constants/routes';
import { useNotifications } from '../../../hooks/useNotifications';
import { useMedicationsList } from '../../../hooks/useMedical';
import { usePet } from '../../../hooks/usePets';
import { DEFAULT_PET_ICON, SPECIES_ICON } from '../../../constants/petConstants';
import MedicationReminderCard from '../../../components/notifications/MedicationReminderCard';
import useTranslation from '../../../hooks/useTranslation';

function formatDate(value, locale) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

export default function MedicationReminder() {
  const [searchParams] = useSearchParams();
  const { language, t } = useTranslation();
  const petId = searchParams.get('petId');
  const [search, setSearch] = useState('');

  const { data: pet } = usePet(petId);
  const { data: medications = [], isLoading: loadingMeds } = useMedicationsList(petId);
  const { notifications, loading: loadingNotifs, takeMedication, remindLater } = useNotifications();

  const petName = pet?.name ?? 'tu mascota';
  const backUrl = petId
    ? `${ROUTES.CLIENT.MEDICATIONS}?petId=${encodeURIComponent(petId)}`
    : ROUTES.CLIENT.MEDICATIONS;

  // Filter notifications that are medication reminders and unread
  const medicationReminders = useMemo(() =>
    notifications.filter(
      (n) => !n.read && (n.medication_name || n.type === 'medication_reminder')
    ),
    [notifications]
  );

  // Filtered medications table
  const filteredMedications = useMemo(() => {
    const q = search.toLowerCase();
    return medications.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.dosage?.toLowerCase().includes(q) ||
        m.frequency?.toLowerCase().includes(q)
    );
  }, [medications, search]);

  const handleTake = async (notificationId) => {
    await takeMedication(notificationId);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: '¡Medicamento marcado como tomado!',
      showConfirmButton: false,
      timer: 2500,
    });
  };

  const handleSnooze = async (notificationId, delayMinutes) => {
    const result = await remindLater(notificationId, delayMinutes);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: `Te recordamos en ${delayMinutes} minutos`,
      showConfirmButton: false,
      timer: 2500,
    });
    return result;
  };

  return (
    <main className="page-container">
      <Link className="pet-dashboard-back" to={backUrl}>
        ← Volver a Medicamentos
      </Link>

      <section className="health-section-page medications-page">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <div className="vaccines-hero">
          <div>
            <h1 className="page-title">Recordatorios de Medicación</h1>
            <p className="text-slate-500 mt-1 text-sm">
              Las alertas son gestionadas automáticamente por el planificador del sistema.
            </p>
          </div>
          {pet && (
            <div className="appointment-pet-summary vaccines-pet-summary">
              {pet.photo_url ? (
                <img src={pet.photo_url} alt={petName} />
              ) : (
                <span>{SPECIES_ICON[pet.species] ?? DEFAULT_PET_ICON}</span>
              )}
              <div>
                <h2>{petName}</h2>
                <p>{pet ? `${t(`petSpecies.${pet.species}`)} · ${t(`petSex.${pet.sex}`)}` : ''}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Active Reminders ──────────────────────────────────── */}
        <section aria-labelledby="reminders-heading" className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <HiBell className="text-teal-600 text-xl" aria-hidden="true" />
            <h2 id="reminders-heading" className="text-lg font-bold text-gray-800">
              Alertas activas
            </h2>
            {medicationReminders.length > 0 && (
              <span className="ml-2 bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {medicationReminders.length}
              </span>
            )}
          </div>

          {loadingNotifs && (
            <p className="text-slate-400 text-sm">Cargando recordatorios...</p>
          )}

          {!loadingNotifs && medicationReminders.length === 0 && (
            <div className="med-reminder-empty">
              <HiCheckCircle className="text-4xl text-teal-300 mb-2" aria-hidden="true" />
              <p className="font-medium text-slate-600">¡Todo al día!</p>
              <p className="text-sm text-slate-400">No hay recordatorios de medicación pendientes.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {medicationReminders.map((notif) => (
              <MedicationReminderCard
                key={notif.id}
                notification={notif}
                onTake={handleTake}
                onSnooze={handleSnooze}
              />
            ))}
          </div>
        </section>

        {/* ── Medication Schedule Table ─────────────────────────── */}
        <section aria-labelledby="schedule-heading" className="mt-10">
          <div className="vaccines-panel">
            <div className="vaccines-panel-header">
              <div>
                <p className="vaccines-panel-label">Base de datos</p>
                <h2 id="schedule-heading">Calendario de Medicación</h2>
              </div>
              <div className="flex items-center gap-2">
                {/* Scheduler indicator */}
                <span
                  className="med-reminder-scheduler-badge"
                  title="El planificador revisa este calendario automáticamente"
                >
                  <HiClock className="inline mr-1" aria-hidden="true" />
                  Auto-scheduler activo
                </span>
                <span className="vaccines-pill">{filteredMedications.length}</span>
              </div>
            </div>

            {/* Search */}
            <div className="mt-4 mb-4">
              <input
                type="search"
                placeholder="Buscar medicamento, dosis o frecuencia..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="med-schedule-search"
                aria-label="Buscar en la tabla de medicamentos"
              />
            </div>

            {loadingMeds ? (
              <p className="text-slate-400 text-sm py-4">Cargando datos...</p>
            ) : filteredMedications.length === 0 ? (
              <div className="vaccines-empty-state">
                <HiCalendar aria-hidden="true" />
                <p>No se encontraron tratamientos</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="med-schedule-table">
                  <thead>
                    <tr>
                      <th scope="col">Mascota ID</th>
                      <th scope="col">Medicamento</th>
                      <th scope="col">Dosis</th>
                      <th scope="col">Frecuencia</th>
                      <th scope="col">Hora</th>
                      <th scope="col">Inicio</th>
                      <th scope="col">Fin</th>
                      <th scope="col">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMedications.map((med) => (
                      <tr key={med.id}>
                        <td className="font-mono text-xs text-slate-400">
                          {med.pet_id ? med.pet_id.slice(0, 8) + '…' : petId?.slice(0, 8) + '…'}
                        </td>
                        <td className="font-medium text-slate-800">{med.name}</td>
                        <td>{med.dosage}</td>
                        <td>{med.frequency}</td>
                        <td>
                          {med.administration_time ? (
                            <span className="flex items-center gap-1">
                              <HiClock className="text-blue-400" aria-hidden="true" />
                              {med.administration_time}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td>{formatDate(med.start_date, language)}</td>
                        <td>{formatDate(med.end_date, language)}</td>
                        <td>
                          <span
                            className={`med-schedule-status ${
                              med.status === 'active'
                                ? 'med-schedule-status--active'
                                : 'med-schedule-status--completed'
                            }`}
                          >
                            {med.status === 'active' ? 'Activo' : 'Completado'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
