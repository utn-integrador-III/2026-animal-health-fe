import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { HiEye, HiEyeOff } from 'react-icons/hi';

import { loginUser } from '../../services/authService';
import useAuthStore from '../../stores/useAuthStore';
import { ROUTES } from '../../constants/routes';
import { getApiErrorMessage } from '../../services/apiError';
import loginBackground from '../../assets/images/tylijura-veterinarian-8859098.jpg';
import animalHealthLogo from '../../assets/logos/LogoAnimalHealth.png';
import Navbar from '../../components/layout/Navbar';

/**
 * FE-US-01 — Login page
 * Split-screen layout matching the official mockup:
 * Left  → Brand hero with description
 * Right → Teal login card
 */
export default function Login() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const authStatus = useAuthStore((state) => state.authStatus);
  const currentRole = useAuthStore((state) => state.role);

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }
    setLoading(true);
    try {
      const data = await loginUser({ email, password });
      setSession({ user: data.user, token: data.access_token });
      if (data.user.role === 'veterinarian') {
        navigate(ROUTES.VET.DASHBOARD, { replace: true });
      } else {
        navigate(ROUTES.CLIENT.DASHBOARD, { replace: true });
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid credentials. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  if (authStatus === 'authenticated') {
    const destination = currentRole === 'veterinarian'
      ? ROUTES.VET.DASHBOARD
      : ROUTES.CLIENT.DASHBOARD;
    return <Navigate to={destination} replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex min-h-[calc(100vh-6rem)] flex-col md:flex-row">

      {/* ── LEFT: Hero panel ──────────────────────────────────────── */}
      <div className="relative flex-1 hidden md:flex flex-col items-start justify-center overflow-hidden">
        {/* Background image overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${loginBackground})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800/70 to-gray-600/40" />

        {/* Brand positioned near the top of the hero panel */}
        <div className="absolute left-12 right-8 top-12 z-10">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow overflow-hidden">
              <img
                src={animalHealthLogo}
                alt="Animal Health logo"
                className="h-12 w-12 object-contain"
              />
            </div>
            <div>
              <p className="text-white font-bold text-xl leading-none">Animal Health</p>
              <p className="text-teal-300 text-xs tracking-widest uppercase">
                Tecnología e Inteligencia Artificial
              </p>
            </div>
          </div>
        </div>

        {/* Main hero content */}
        <div className="relative z-10 px-12 py-10 max-w-xl">
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Animal Health
          </h2>
          <p className="text-gray-200 text-base leading-relaxed">
            Manage medical records,
            track vaccinations,
            schedule appointments,
            and receive preventative
            recommendations to give your pets
            the care they deserve.<br /><br />
            Animal Health connects pet owners
            and veterinarians on a modern, secure,
            and easy-to-use platform.
          </p>

          <p className="mt-8 text-teal-300 text-sm italic">
            — Cuidamos hoy, prevenimos mañana —
          </p>
        </div>
      </div>

      {/* ── RIGHT: Login card ─────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-100">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex md:hidden items-center gap-2 mb-6 justify-center">
            <img
              src={animalHealthLogo}
              alt="Animal Health logo"
              className="h-12 w-12 rounded-full bg-white object-contain shadow"
            />
            <span className="text-2xl font-bold text-teal-700">Animal Health</span>
          </div>

          {/* Teal card */}
          <div className="bg-teal-600 rounded-3xl shadow-2xl px-8 py-9 text-white">
            <h1 className="text-3xl font-bold text-center mb-7">Log in</h1>

            {/* Error */}
            {error && (
              <div className="mb-4 rounded-xl bg-red-500/20 border border-red-300/40 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-teal-100 mb-1">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Value"
                  className="w-full px-4 py-2.5 rounded-xl bg-white text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-teal-100 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Value"
                    className="w-full px-4 py-2.5 pr-10 rounded-xl bg-white text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? <HiEyeOff className="h-4 w-4" /> : <HiEye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="text-right mt-1.5">
                  <button type="button" className="text-xs text-yellow-300 hover:text-yellow-200 font-medium transition">
                    Forgot password ?
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  id="btn-login-submit"
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-full bg-teal-400 hover:bg-teal-300 text-teal-900 font-semibold py-2.5 text-sm transition disabled:opacity-60 disabled:cursor-not-allowed shadow"
                >
                  {loading ? 'Signing in…' : 'Accept'}
                </button>
                <button
                  type="button"
                  onClick={() => { setEmail(''); setPassword(''); setError(''); }}
                  className="flex-1 rounded-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2.5 text-sm transition shadow"
                >
                  Cancel
                </button>
              </div>
            </form>

            {/* Sign up link */}
            <p className="mt-6 text-center text-sm text-teal-100">
              Don&apos;t have an account?{' '}
              <Link
                to={ROUTES.AUTH.REGISTER}
                className="font-bold text-yellow-300 hover:text-yellow-200 transition"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
