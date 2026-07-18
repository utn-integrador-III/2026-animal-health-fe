import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

export default function Unauthorized() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
        <h1 className="text-2xl font-bold text-slate-900">Access denied</h1>
        <p className="mt-3 text-slate-600">
          Your account does not have permission to open this section.
        </p>
        <Link
          to={ROUTES.AUTH.LOGIN}
          className="mt-6 inline-flex rounded-lg bg-teal-500 px-4 py-2 font-semibold text-white"
        >
          Back to login
        </Link>
      </section>
    </main>
  );
}