import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import { ROUTES } from '../../constants/routes';
import { SWAL_PRESETS } from '../../constants/swalConfig';
import { useCreateVeterinarian } from '../../hooks/useVeterinarians';
import { getApiErrorMessage } from '../../services/apiError';

export default function VetCreate() {
  const navigate = useNavigate();
  const { mutateAsync: createVeterinarian, isPending } = useCreateVeterinarian();

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    specialty: '',
    license_number: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationErrors = {};
    if (!form.full_name.trim()) validationErrors.full_name = 'Full name is required.';
    if (!form.email.trim()) validationErrors.email = 'Email is required.';
    if (!form.password || form.password.length < 8) {
      validationErrors.password = 'Use at least 8 characters.';
    }
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    try {
      await createVeterinarian({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || null,
        specialty: form.specialty.trim() || null,
        license_number: form.license_number.trim() || null,
      });

      await Swal.fire({
        ...SWAL_PRESETS.SUCCESS,
        title: 'Veterinarian created!',
        text: `${form.full_name} was added successfully.`,
      });
      navigate(ROUTES.ADMIN.VETERINARIANS, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not create the veterinarian. Please try again.'));
    }
  };

  const inputCls =
    'w-full px-3 py-2 rounded-xl border border-slate-200 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400';
  const labelCls = 'block text-xs font-medium text-slate-600 mb-1';

  return (
    <main className="page-container">
      <div className="mx-auto max-w-5xl">
        <header className="page-header">
          <div>
            <p className="page-eyebrow">Admin area</p>
            <h1 className="page-title">Add veterinarian</h1>
            <p className="page-subtitle">
              Create a veterinarian account. They will be able to log in with
              this email and password.
            </p>
          </div>
        </header>

        <section className="surface-card">
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="max-w-xl">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label htmlFor="vet-fullname" className={labelCls}>Full name</label>
                <input id="vet-fullname" type="text" value={form.full_name}
                  onChange={set('full_name')} className={inputCls} />
                {fieldErrors.full_name && (
                  <p className="mt-1 text-xs text-red-500">{fieldErrors.full_name}</p>
                )}
              </div>
              <div>
                <label htmlFor="vet-email" className={labelCls}>Email</label>
                <input id="vet-email" type="email" value={form.email}
                  onChange={set('email')} className={inputCls} />
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label htmlFor="vet-password" className={labelCls}>Password</label>
                <input id="vet-password" type="password" autoComplete="new-password"
                  value={form.password} onChange={set('password')} className={inputCls} />
                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
                )}
              </div>
              <div>
                <label htmlFor="vet-phone" className={labelCls}>Phone (optional)</label>
                <input id="vet-phone" type="tel" value={form.phone}
                  onChange={set('phone')} className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div>
                <label htmlFor="vet-specialty" className={labelCls}>Specialty (optional)</label>
                <input id="vet-specialty" type="text" value={form.specialty}
                  onChange={set('specialty')} className={inputCls} />
              </div>
              <div>
                <label htmlFor="vet-license" className={labelCls}>License number (optional)</label>
                <input id="vet-license" type="text" value={form.license_number}
                  onChange={set('license_number')} className={inputCls} />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-teal-600 hover:bg-teal-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPending ? 'Creating...' : 'Create veterinarian'}
              </button>
              <Link
                to={ROUTES.ADMIN.VETERINARIANS}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </Link>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
