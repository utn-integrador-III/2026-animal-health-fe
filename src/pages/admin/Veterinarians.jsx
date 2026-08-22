import { Link } from 'react-router-dom';

import { ROUTES } from '../../constants/routes';
import { useVeterinariansList } from '../../hooks/useVeterinarians';
import { getApiErrorMessage } from '../../services/apiError';
import Loader from '../../components/common/Loader';

export default function Veterinarians() {
  const { data: veterinarians, isLoading, isError, error } = useVeterinariansList();

  return (
    <main className="page-container">
      <div className="mx-auto max-w-5xl">
        <header className="page-header">
          <div>
            <p className="page-eyebrow">Admin area</p>
            <h1 className="page-title">Veterinarians</h1>
            <p className="page-subtitle">
              Veterinarians registered on the platform.
            </p>
          </div>
          <Link
            to={ROUTES.ADMIN.VET_CREATE}
            className="inline-block rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Add veterinarian
          </Link>
        </header>

        <section className="surface-card">
          {isLoading && <Loader label="Loading veterinarians..." />}

          {isError && (
            <p className="text-sm text-red-500">
              {getApiErrorMessage(error, 'Could not load veterinarians.')}
            </p>
          )}

          {!isLoading && !isError && veterinarians?.length === 0 && (
            <p className="text-sm text-slate-500">
              No veterinarians registered yet.
            </p>
          )}

          {!isLoading && !isError && veterinarians?.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2 pr-4 font-medium">Name</th>
                    <th className="py-2 pr-4 font-medium">Email</th>
                    <th className="py-2 pr-4 font-medium">Phone</th>
                    <th className="py-2 pr-4 font-medium">Specialty</th>
                    <th className="py-2 pr-4 font-medium">License</th>
                  </tr>
                </thead>
                <tbody>
                  {veterinarians.map((vet) => (
                    <tr key={vet.id} className="border-b border-slate-100">
                      <td className="py-2 pr-4">{vet.full_name}</td>
                      <td className="py-2 pr-4">{vet.email}</td>
                      <td className="py-2 pr-4">{vet.phone || '—'}</td>
                      <td className="py-2 pr-4">{vet.specialty || '—'}</td>
                      <td className="py-2 pr-4">{vet.license_number || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
