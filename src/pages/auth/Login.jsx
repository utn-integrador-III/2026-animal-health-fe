import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import animalHealthLogo from '../../assets/logos/LogoAnimalHealth.png';
import animalHealthLogoTransparent from '../../assets/logos/LogoAnimalHealth-removebg-cropped.png';
import loginBackground from '../../assets/images/tylijura-veterinarian-8859098.jpg';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Footer from '../../components/layout/Footer';
import Navbar from '../../components/layout/Navbar';
import { ROUTES } from '../../constants/routes';
import { loginUser } from '../../services/authService';
import { getApiErrorMessage } from '../../services/apiError';
import useAuthStore from '../../stores/useAuthStore';
import { getHomeRouteByRole } from '../../utils/roleRedirect';
import useTranslation from '../../hooks/useTranslation';

export default function Login() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const { t } = useTranslation();
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
      navigate(getHomeRouteByRole(authData.user?.role), { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, t('login.invalidCredentials')));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <Navbar />
      <main className="flex min-h-[calc(100vh-6rem)] bg-slate-100">
      <section className="relative hidden flex-1 overflow-hidden lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${loginBackground})` }}
        />
        <div className="absolute inset-0 bg-teal-950/45" />
        <div className="relative z-10 flex h-full max-w-2xl flex-col justify-between p-12 text-white">
          <div className="inline-flex rounded-3xl bg-white/25 p-3 shadow-lg ring-1 ring-white/35 backdrop-blur-sm">
            <img
              src={animalHealthLogoTransparent}
              alt="Animal Health"
              className="h-40 w-auto object-contain"
            />
          </div>
          <div>
            <h1 className="max-w-md text-4xl font-bold">{t('login.welcomeBack')}</h1>
            <p className="mt-4 max-w-xl text-base font-semibold leading-7 text-teal-50">
              {t('login.sideDescription')}
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl rounded-2xl bg-white p-10 shadow-xl">
          <div className="mb-8 text-center">
            <img
              src={animalHealthLogo}
              alt="Animal Health"
              className="mx-auto h-20 w-20 rounded-full object-contain"
            />
            <h1 className="mt-4 text-4xl font-bold text-slate-900">{t('login.title')}</h1>
            <p className="mt-2 text-base text-slate-500">
              {t('login.subtitle')}
            </p>
          </div>

          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              id="login-email"
              label={t('login.email')}
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={updateField('email')}
              required
            />
            <Input
              id="login-password"
              label={t('login.password')}
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={updateField('password')}
              required
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              {t('login.submit')}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {t('login.noAccount')}{' '}
            <Link className="font-semibold text-teal-700" to={ROUTES.AUTH.REGISTER}>
              {t('login.createOne')}
            </Link>
          </p>
        </div>
      </section>
      </main>
      <Footer />
    </div>
  );
}
