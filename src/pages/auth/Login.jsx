import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import animalHealthLogo from '../../assets/logos/LogoAnimalHealth.png';
import loginBackground from '../../assets/images/tylijura-veterinarian-8859098.jpg';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { ROUTES } from '../../constants/routes';
import { loginUser } from '../../services/authService';
import { getApiErrorMessage } from '../../services/apiError';
import useAuthStore from '../../stores/useAuthStore';

export default function Login() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const authData = await loginUser(form);
      setSession({
        user: authData.user,
        token: authData.access_token,
      });
      navigate(ROUTES.CLIENT.PETS, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid email or password.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen bg-slate-100">
      <section className="relative hidden flex-1 overflow-hidden lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${loginBackground})` }}
        />
        <div className="absolute inset-0 bg-teal-950/45" />
        <div className="relative z-10 flex h-full max-w-xl flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <img
              src={animalHealthLogo}
              alt="Animal Health"
              className="h-14 w-14 rounded-full bg-white/90 object-contain"
            />
            <div>
              <p className="text-2xl font-bold">Animal Health</p>
              <p className="text-sm text-teal-100">Client portal</p>
            </div>
          </div>
          <div>
            <h1 className="max-w-md text-4xl font-bold">Welcome back</h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-teal-50">
              Manage pet profiles, appointments, and health information from one place.
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
          <div className="mb-8 text-center">
            <img
              src={animalHealthLogo}
              alt="Animal Health"
              className="mx-auto h-16 w-16 rounded-full object-contain"
            />
            <h1 className="mt-4 text-3xl font-bold text-slate-900">Sign in</h1>
            <p className="mt-1 text-sm text-slate-500">
              Access your Animal Health account.
            </p>
          </div>

          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              id="login-email"
              label="Email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={updateField('email')}
              required
            />
            <Input
              id="login-password"
              label="Password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={updateField('password')}
              required
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            No account yet?{' '}
            <Link className="font-semibold text-teal-700" to={ROUTES.AUTH.REGISTER}>
              Create one
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
