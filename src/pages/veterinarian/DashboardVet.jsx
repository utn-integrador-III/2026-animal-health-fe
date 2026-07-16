import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiCalendar, HiChevronLeft, HiChevronRight, HiClock } from 'react-icons/hi';

import Loader from '../../components/common/Loader';
import { DEFAULT_PET_ICON, SPECIES_ICON } from '../../constants/petConstants';
import { ROUTES } from '../../constants/routes';
import { useAppointments } from '../../hooks/useAppointments';
import useAuthStore from '../../stores/useAuthStore';

function todayIsoDate() {
  return new Date().toISOString().split('T')[0];
}

function toIsoDate(date) {
  return date.toISOString().split('T')[0];
}

function dateFromIso(value) {
  return new Date(`${value}T00:00:00`);
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function displayDoctorName(fullName) {
  if (!fullName) return 'Doctor';
  return fullName.startsWith('Dr.') ? fullName : `Dr. ${fullName}`;
}

function formatTime(value) {
  if (!value) return '';
  const [hours, minutes] = value.split(':');
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);
  return new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatLongDate(value) {
  return new Intl.DateTimeFormat('en', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(dateFromIso(value));
}

function getMonthDays(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const leadingEmptyDays = firstDay.getDay();
  const days = [];

  for (let index = 0; index < leadingEmptyDays; index += 1) {
    days.push(null);
  }
  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push(new Date(year, month, day));
  }
  return days;
}

export default function DashboardVet() {
  const user = useAuthStore((state) => state.user);
  const [selectedDate, setSelectedDate] = useState(todayIsoDate());
  const [visibleMonth, setVisibleMonth] = useState(() => dateFromIso(todayIsoDate()));
  const { data: appointments = [], isLoading, isError } = useAppointments({ enabled: true });

  if (isLoading) return <Loader label="Loading today's patients..." />;

  const scheduledAppointments = appointments.filter((appointment) => (
    appointment.status === 'scheduled'
  ));
  const selectedDateAppointments = scheduledAppointments
    .filter((appointment) => appointment.appointment_date === selectedDate)
    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
  const monthlyAppointments = scheduledAppointments.filter((appointment) => (
    monthKey(dateFromIso(appointment.appointment_date)) === monthKey(visibleMonth)
  ));
  const appointmentsByDate = monthlyAppointments.reduce((summary, appointment) => {
    summary[appointment.appointment_date] = (summary[appointment.appointment_date] ?? 0) + 1;
    return summary;
  }, {});
  const monthDays = getMonthDays(visibleMonth);
  const visibleMonthLabel = new Intl.DateTimeFormat('en', {
    month: 'long',
    year: 'numeric',
  }).format(visibleMonth);

  const goToPreviousMonth = () => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  };

  const handleDateInputChange = (event) => {
    const nextDate = event.target.value;
    setSelectedDate(nextDate);
    setVisibleMonth(dateFromIso(nextDate));
  };

  const handleCalendarDayClick = (date) => {
    setSelectedDate(toIsoDate(date));
  };

  return (
    <main className="vet-dashboard page-container">
      <header className="vet-dashboard-header">
        <h1>Hi {displayDoctorName(user?.full_name)},</h1>
        <p>Ready to help your patients!</p>
      </header>

      <section className="vet-summary-grid" aria-label="Veterinarian daily summary">
        <article className="vet-summary-card">
          <span><HiCalendar aria-hidden="true" /></span>
          <strong>{selectedDateAppointments.length}</strong>
          <p>Appointments selected day</p>
        </article>
        <article className="vet-summary-card">
          <span><HiClock aria-hidden="true" /></span>
          <strong>{monthlyAppointments.length}</strong>
          <p>Appointments this month</p>
        </article>
      </section>

      <section className="vet-calendar-card" aria-label="Monthly appointment calendar">
        <div className="vet-calendar-header">
          <div>
            <h2>Monthly workload</h2>
            <p>Select a day to review the assigned patients.</p>
          </div>
          <label>
            Date
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateInputChange}
            />
          </label>
        </div>
        <div className="vet-calendar-monthbar">
          <button type="button" onClick={goToPreviousMonth} aria-label="Previous month">
            <HiChevronLeft aria-hidden="true" />
          </button>
          <strong>{visibleMonthLabel}</strong>
          <button type="button" onClick={goToNextMonth} aria-label="Next month">
            <HiChevronRight aria-hidden="true" />
          </button>
        </div>
        <div className="vet-calendar-weekdays" aria-hidden="true">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="vet-calendar-grid">
          {monthDays.map((date, index) => {
            if (!date) {
              return <span key={`empty-${index}`} className="vet-calendar-empty" />;
            }
            const isoDate = toIsoDate(date);
            const count = appointmentsByDate[isoDate] ?? 0;
            const isSelected = isoDate === selectedDate;
            const isToday = isoDate === todayIsoDate();
            return (
              <button
                key={isoDate}
                type="button"
                className={[
                  'vet-calendar-day',
                  isSelected ? 'vet-calendar-day-selected' : '',
                  isToday ? 'vet-calendar-day-today' : '',
                ].join(' ')}
                onClick={() => handleCalendarDayClick(date)}
              >
                <span>{date.getDate()}</span>
                {count > 0 && <strong>{count}</strong>}
              </button>
            );
          })}
        </div>
      </section>

      <section className="vet-patient-table-card">
        <h2>Appointments for {formatLongDate(selectedDate)}</h2>

        {isError && (
          <p className="status-error">
            Patient assignments could not be loaded.
          </p>
        )}

        {!isError && selectedDateAppointments.length === 0 && (
          <p className="vet-empty-patients">
            No patients are assigned for this day.
          </p>
        )}

        {!isError && selectedDateAppointments.length > 0 && (
          <div className="vet-patient-table-wrap">
            <table className="vet-patient-table">
              <thead>
                <tr>
                  <th>Pet name</th>
                  <th>Owner</th>
                  <th>Species</th>
                  <th>Breed</th>
                  <th>Time</th>
                  <th>Last visit</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {selectedDateAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>
                      <span className="vet-patient-name">
                        {appointment.pet_photo_url ? (
                          <img src={appointment.pet_photo_url} alt={appointment.pet_name} />
                        ) : (
                          <span>{SPECIES_ICON[appointment.pet_species] ?? DEFAULT_PET_ICON}</span>
                        )}
                        {appointment.pet_name}
                      </span>
                    </td>
                    <td>{appointment.owner_name ?? 'Client'}</td>
                    <td>{appointment.pet_species}</td>
                    <td>{appointment.pet_breed ?? 'Not specified'}</td>
                    <td>{formatTime(appointment.appointment_time)}</td>
                    <td>{appointment.last_visit ?? '--'}</td>
                    <td>
                      <span className="vet-status-confirmed">
                        {appointment.status === 'scheduled' ? 'Confirmed' : appointment.status}
                      </span>
                    </td>
                    <td>
                      <Link
                        className="vet-start-link"
                        to={ROUTES.VET.PATIENT.replace(':appointmentId', appointment.id)}
                      >
                        Start Appointment
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
