import { HiOutlineUsers } from 'react-icons/hi';

import { usePetsList } from '../../hooks/usePets';
import useAuthStore from '../../stores/useAuthStore';
import Loader from '../../components/common/Loader';

export default function DashboardVet() {
  const user = useAuthStore((state) => state.user);
  const { data: patients = [], isLoading, isError } = usePetsList();

  if (isLoading) return <Loader label="Loading today's patients..." />;

  return (
    <main className="page-container">
      <div className="mx-auto max-w-5xl">
        <header className="page-header">
          <div>
            <p className="page-eyebrow">Veterinarian area</p>
            <h1 className="page-title">
              Dr. {user?.full_name}
            </h1>
            <p className="page-subtitle">
              Patients shown here are assigned through today&apos;s appointments.
            </p>
          </div>
        </header>

        <section className="surface-card">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-teal-50 p-3 text-teal-600">
              <HiOutlineUsers className="text-2xl" />
            </div>
            <div>
              <h2 className="section-title">Today&apos;s patients</h2>
              <p className="text-sm text-slate-500">{patients.length} assigned</p>
            </div>
          </div>

          {isError && (
            <p className="status-error">
              Patient assignments could not be loaded.
            </p>
          )}

          {!isError && patients.length === 0 && (
            <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
              No patients are assigned for today.
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {patients.map((patient) => (
              <article
                key={patient.id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <h3 className="font-bold text-slate-800">{patient.name}</h3>
                <p className="text-sm text-slate-500">
                  {patient.species} / {patient.breed_primary} / {patient.weight_kg} kg
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}