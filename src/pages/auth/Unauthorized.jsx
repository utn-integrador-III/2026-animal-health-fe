import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import useAuthStore from '../../stores/useAuthStore';

/**
 * Unauthorized page — shown when a user tries to access a route
 * they don't have permission for.
 */
export default function Unauthorized() {
  const role = useAuthStore((state) => state.role);
  const destination = role === 'veterinarian'
    ? ROUTES.VET.DASHBOARD
    : ROUTES.CLIENT.DASHBOARD;
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 px-4">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access denied</h1>
        <p className="text-sm text-gray-500 mb-6">
          You don&apos;t have permission to view this page.
        </p>
        <Link
          to={destination}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
