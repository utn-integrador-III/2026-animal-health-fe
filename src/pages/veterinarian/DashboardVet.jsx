import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiCalendar, HiChevronLeft, HiChevronRight, HiClock } from 'react-icons/hi';

import Loader from '../../components/common/Loader';
import { DEFAULT_PET_ICON, SPECIES_ICON } from '../../constants/petConstants';
import { ROUTES } from '../../constants/routes';
import { useAppointments } from '../../hooks/useAppointments';
import useTranslation from '../../hooks/useTranslation';
import useAuthStore from '../../stores/useAuthStore';

const LOCALE_BY_LANGUAGE = {
  en: 'en-US',
  es: 'es-CR',
};

const WEEKDAY_KEYS = [
  'vetDashboard.weekday.sun',
  'vetDashboard.weekday.mon',
  'vetDashboard.weekday.tue',
  'vetDashboard.weekday.wed',
  'vetDashboard.weekday.thu',
  'vetDashboard.weekday.fri',
  'vetDashboard.weekday.sat',
];

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

function displayDoctorName(fullName, fallback) {
  if (!fullName) return fallback;
  return fullName.startsWith('Dr.') ? fullName : `Dr. ${fullName}`;
}

function formatTime(value, locale) {
  if (!value) return '';
  const [hours, minutes] = value.split(':');
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatLongDate(value, locale) {
  return new Intl.DateTimeFormat(locale, {
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
  const { language, t } = useTranslation();
  const locale = LOCALE_BY_LANGUAGE[language] ?? LOCALE_BY_LANGUAGE.en;
  const [selectedDate, setSelectedDate] = useState(todayIsoDate());
  const [visibleMonth, setVisibleMonth] = useState(() => dateFromIso(todayIsoDate()));
  const { data: appointments = [], isLoading, isError } = useAppointments({ enabled: true });

  if (isLoading) return <Loader label={t('vetDashboard.loading')} />;

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
  const visibleMonthLabel = new Intl.DateTimeFormat(locale, {
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
        <h1>{t('vetDashboard.greeting', {
          doctorName: displayDoctorName(user?.full_name, t('vetDashboard.doctorFallback')),
        })}</h1>
        <p>{t('vetDashboard.subtitle')}</p>
      </header>

      <section className="vet-summary-grid" aria-label={t('vetDashboard.summaryAria')}>
        <article className="vet-summary-card">
          <span><HiCalendar aria-hidden="true" /></span>
          <strong>{selectedDateAppointments.length}</strong>
          <p>{t('vetDashboard.selectedDayCount')}</p>
        </article>
        <article className="vet-summary-card">
          <span><HiClock aria-hidden="true" /></span>
          <strong>{monthlyAppointments.length}</strong>
          <p>{t('vetDashboard.monthCount')}</p>
        </article>
      </section>

      <section className="vet-calendar-card" aria-label={t('vetDashboard.calendarAria')}>
        <div className="vet-calendar-header">
          <div>
            <h2>{t('vetDashboard.monthlyWorkload')}</h2>
            <p>{t('vetDashboard.monthlyWorkloadHelp')}</p>
          </div>
          <label>
            {t('appointments.date')}
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateInputChange}
            />
          </label>
        </div>
        <div className="vet-calendar-monthbar">
          <button type="button" onClick={goToPreviousMonth} aria-label={t('vetDashboard.previousMonth')}>
            <HiChevronLeft aria-hidden="true" />
          </button>
          <strong>{visibleMonthLabel}</strong>
          <button type="button" onClick={goToNextMonth} aria-label={t('vetDashboard.nextMonth')}>
            <HiChevronRight aria-hidden="true" />
          </button>
        </div>
        <div className="vet-calendar-weekdays" aria-hidden="true">
          {WEEKDAY_KEYS.map((dayKey) => (
            <span key={dayKey}>{t(dayKey)}</span>
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
        <h2>{t('vetDashboard.appointmentsFor', {
          date: formatLongDate(selectedDate, locale),
        })}</h2>

        {isError && (
          <p className="status-error">
            {t('vetDashboard.loadError')}
          </p>
        )}

        {!isError && selectedDateAppointments.length === 0 && (
          <p className="vet-empty-patients">
            {t('vetDashboard.emptyDay')}
          </p>
        )}

        {!isError && selectedDateAppointments.length > 0 && (
          <div className="vet-patient-table-wrap">
            <table className="vet-patient-table">
              <thead>
                <tr>
                  <th>{t('vetDashboard.table.petName')}</th>
                  <th>{t('vetDashboard.table.owner')}</th>
                  <th>{t('vetDashboard.table.species')}</th>
                  <th>{t('vetDashboard.table.breed')}</th>
                  <th>{t('vetDashboard.table.time')}</th>
                  <th>{t('vetDashboard.table.lastVisit')}</th>
                  <th>{t('vetDashboard.table.status')}</th>
                  <th aria-label={t('vetDashboard.table.actions')} />
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
                    <td>{appointment.owner_name ?? t('vetPatient.clientFallback')}</td>
                    <td>{t(`petSpecies.${appointment.pet_species}`)}</td>
                    <td>{appointment.pet_breed ?? t('vetDashboard.notSpecified')}</td>
                    <td>{formatTime(appointment.appointment_time, locale)}</td>
                    <td>{appointment.last_visit ?? '--'}</td>
                    <td>
                      <span className="vet-status-confirmed">
                        {appointment.status === 'scheduled'
                          ? t('vetDashboard.status.confirmed')
                          : t(`appointments.status.${appointment.status}`)}
                      </span>
                    </td>
                    <td>
                      <Link
                        className="vet-start-link"
                        to={ROUTES.VET.PATIENT.replace(':appointmentId', appointment.id)}
                      >
                        {t('vetDashboard.startAppointment')}
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