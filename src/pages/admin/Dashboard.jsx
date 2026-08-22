import { HiOutlineShieldCheck } from 'react-icons/hi';

import useAuthStore from '../../stores/useAuthStore';

export default function DashboardAdmin() {
  const user = useAuthStore((state) => state.user);

  return (
    <main className="page-container">
      <div className="mx-auto max-w-5xl">
        <header className="page-header">
          <div>
            <p className="page-eyebrow">Admin area</p>
            <h1 className="page-title">
              Welcome, {user?.full_name}
            </h1>
            <p className="page-subtitle">
              Administration tools for Animal Health.
            </p>
          </div>
        </header>

        <section className="surface-card">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-teal-50 p-3 text-teal-600">
              <HiOutlineShieldCheck className="text-2xl" />
            </div>
            <div>
              <h2 className="section-title">Account overview</h2>
              <p className="text-sm text-slate-500">{user?.email}</p>
            </div>
          </div>
          <p className="text-sm text-slate-500">
            Veterinarian management is not connected to the backend yet.
          </p>
        </section>
      </div>
    </main>
  );
}
