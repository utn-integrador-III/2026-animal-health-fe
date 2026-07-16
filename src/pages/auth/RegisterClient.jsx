import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import Swal from 'sweetalert2';

import { registerUser } from '../../services/authService';
import useAuthStore     from '../../stores/useAuthStore';
import { ROUTES }       from '../../constants/routes';
import { PET_SPECIES, PET_SEX } from '../../constants/petConstants';
import { SWAL_PRESETS } from '../../constants/swalConfig';
import { getApiErrorMessage } from '../../services/apiError';
import loginBackground from '../../assets/images/mtajmr-animals-7862112.jpg';
import animalHealthLogo from '../../assets/logos/LogoAnimalHealth.png';
import Navbar from '../../components/layout/Navbar';

function FieldError({ errors, name }) {
  return errors[name]
    ? <p className="mt-1 text-xs text-yellow-200">{errors[name]}</p>
    : null;
}

/**
 * FE-US-01 + FE-US-02 — Client Registration
 * Layout matches the official mockup: image left, teal card right.
 *
 * POST /api/auth/register creates the client and first pet together.
 */
export default function RegisterClient() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  const [form, setForm] = useState({
    first_name:      '',
    last_name:       '',
    email:           '',
    phone:           '',
    pet_name:        '',
    pet_day:         '',
    pet_month:       '',
    pet_year:        '',
    pet_species:     '',
    pet_sex:         '',
    pet_weight:      '',
    pet_breed_primary:   '',
    pet_breed_secondary: '',
    password:        '',
    confirm_password:'',
    privacy_policy:  false,
  });
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: val }));
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const validationErrors = {};
    const required = {
      first_name: 'Owner name is required.',
      last_name: 'Last name is required.',
      email: 'Email is required.',
      phone: 'Contact number is required.',
      pet_name: 'Pet name is required.',
      pet_species: 'Select a species.',
      pet_sex: 'Select Female or Male.',
      pet_weight: 'Weight is required.',
      pet_breed_primary: 'Primary breed is required.',
      password: 'Password is required.',
      confirm_password: 'Confirm the password.',
    };
    Object.entries(required).forEach(([field, message]) => {
      if (!String(form[field]).trim()) validationErrors[field] = message;
    });
    if (!form.pet_day || !form.pet_month || !form.pet_year) {
      validationErrors.pet_birth_date = 'Complete the pet date of birth.';
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      validationErrors.email = 'Enter a valid email address.';
    }
    if (form.password && form.password.length < 8) {
      validationErrors.password = 'Use at least 8 characters.';
    }
    if (form.password !== form.confirm_password) {
      validationErrors.confirm_password = 'Passwords do not match.';
    }
    const weight = Number(form.pet_weight);
    if (!Number.isFinite(weight) || weight <= 0 || weight > 999) {
      validationErrors.pet_weight = 'Enter a weight between 0.1 and 999 kg.';
    }
    if (!form.privacy_policy) {
      validationErrors.privacy_policy = 'Accept the Privacy Policy to continue.';
    }
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    // Build birth_date as YYYY-MM-DD
    const day   = String(form.pet_day).padStart(2, '0');
    const month = String(form.pet_month).padStart(2, '0');
    const year  = form.pet_year;
    if (!day || !month || !year || year.length !== 4) {
      setError('Please enter a valid pet birth date.');
      return;
    }
    const birth_date = `${year}-${month}-${day}`;
    const parsedBirthDate = new Date(`${birth_date}T00:00:00`);
    if (
      Number.isNaN(parsedBirthDate.getTime()) ||
      parsedBirthDate.getFullYear() !== Number(year) ||
      parsedBirthDate.getMonth() + 1 !== Number(month) ||
      parsedBirthDate.getDate() !== Number(day) ||
      parsedBirthDate > new Date()
    ) {
      setFieldErrors({
        pet_birth_date: 'Enter a valid date that is not in the future.',
      });
      return;
    }

    setLoading(true);
    try {
      const authData = await registerUser({
        full_name: `${form.first_name.trim()} ${form.last_name.trim()}`,
        email:     form.email,
        phone:     form.phone,
        password:  form.password,
        initial_pet: {
          name:             form.pet_name,
          birth_date,
          species:          form.pet_species,
          sex:              form.pet_sex,
          breed_primary:    form.pet_breed_primary,
          breed_secondary:  form.pet_breed_secondary || null,
          mixed_breed:      !!form.pet_breed_secondary,
          weight_kg:        weight,
        },
      });

      const token = authData.access_token;
      setSession({ user: authData.user, token });

      await Swal.fire({
        ...SWAL_PRESETS.SUCCESS,
        title: 'Account created!',
        text: `${form.pet_name} has been registered successfully.`,
      });
      navigate(ROUTES.CLIENT.PETS, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(
        err,
        'Registration failed. Please try again.',
      ));
    } finally {
      setLoading(false);
    }
  };

  // ── Shared styles ───────────────────────────────────────────────
  const inputCls =
    'w-full px-3 py-2 rounded-xl bg-white text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50';
  const labelCls = 'block text-xs font-medium text-teal-100 mb-1';
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex min-h-[calc(100vh-6rem)] flex-col md:flex-row">

      {/* ── LEFT: Hero ─────────────────────────────────────────── */}
      <div className="relative flex-1 hidden md:flex flex-col items-start justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${loginBackground})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-teal-800/60 to-teal-600/30" />

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
              <p className="text-teal-200 text-xs tracking-widest uppercase">
                Tecnología e Inteligencia Artificial
              </p>
            </div>
          </div>
        </div>

        {/* Main hero content */}
        <div className="relative z-10 px-12 py-10 max-w-md">
          <h2 className="text-3xl font-bold text-white mb-3">Join Animal Health</h2>
          <p className="text-gray-200 text-sm leading-relaxed">
            Create your account and register your pet's health profile.
            Track vaccinations, medications, lab results, and appointments
            — all in one place.
          </p>
          <p className="mt-6 text-teal-200 text-xs italic">— Cuidamos hoy, prevenimos mañana —</p>
        </div>
      </div>

      {/* ── RIGHT: Registration card ───────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 bg-gray-100">
        <div className="w-full max-w-xl">

          {/* Mobile logo */}
          <div className="flex md:hidden items-center gap-2 mb-5 justify-center">
            <img
              src={animalHealthLogo}
              alt="Animal Health logo"
              className="h-12 w-12 rounded-full bg-white object-contain shadow"
            />
            <span className="text-xl font-bold text-teal-700">Animal Health</span>
          </div>

          {/* Teal card */}
          <div className="bg-teal-600 rounded-3xl shadow-2xl px-8 py-8 text-white">
            <h1 className="text-3xl font-bold text-center mb-6">Sign up</h1>

            {/* Error */}
            {error && (
              <div className="mb-4 rounded-xl bg-red-500/20 border border-red-300/40 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>

              {/* ── Owner data ─────────────────────────────────── */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label htmlFor="reg-firstname" className={labelCls}>Name owner</label>
                  <input id="reg-firstname" type="text" required value={form.first_name}
                    onChange={set('first_name')} placeholder="Value" className={inputCls} />
                  <FieldError errors={fieldErrors} name="first_name" />
                </div>
                <div>
                  <label htmlFor="reg-lastname" className={labelCls}>Lastname</label>
                  <input id="reg-lastname" type="text" required value={form.last_name}
                    onChange={set('last_name')} placeholder="Value" className={inputCls} />
                  <FieldError errors={fieldErrors} name="last_name" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label htmlFor="reg-email" className={labelCls}>Email</label>
                  <input id="reg-email" type="email" autoComplete="email" required
                    value={form.email} onChange={set('email')} placeholder="Value" className={inputCls} />
                  <FieldError errors={fieldErrors} name="email" />
                </div>
                <div>
                  <label htmlFor="reg-phone" className={labelCls}>Phone number</label>
                  <input id="reg-phone" type="tel" required value={form.phone}
                    onChange={set('phone')} placeholder="Value" className={inputCls} />
                  <FieldError errors={fieldErrors} name="phone" />
                </div>
              </div>

              {/* ── Pet data ───────────────────────────────────── */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label htmlFor="reg-petname" className={labelCls}>Pet name</label>
                  <input id="reg-petname" type="text" required value={form.pet_name}
                    onChange={set('pet_name')} placeholder="Value" className={inputCls} />
                  <FieldError errors={fieldErrors} name="pet_name" />
                </div>
                <div>
                  <label className={labelCls}>Pet&apos;s date of birth</label>
                  <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,1.35fr)] gap-2">
                    <input id="reg-petday" type="number" min="1" max="31" required
                      value={form.pet_day} onChange={set('pet_day')}
                      placeholder="DD" aria-label="Pet birth day"
                      className={`${inputCls} min-w-0 text-center`} />
                    <input id="reg-petmonth" type="number" min="1" max="12" required
                      value={form.pet_month} onChange={set('pet_month')}
                      placeholder="MM" aria-label="Pet birth month"
                      className={`${inputCls} min-w-0 text-center`} />
                    <input id="reg-petyear" type="number" min="1900"
                      max={new Date().getFullYear()} required
                      value={form.pet_year} onChange={set('pet_year')}
                      placeholder="YYYY" aria-label="Pet birth year"
                      className={`${inputCls} min-w-0 text-center`} />
                  </div>
                  <FieldError errors={fieldErrors} name="pet_birth_date" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label htmlFor="reg-species" className={labelCls}>Species of pet</label>
                  <select id="reg-species" required value={form.pet_species}
                    onChange={set('pet_species')} className={inputCls}>
                    <option value="">Select species</option>
                    {PET_SPECIES.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <FieldError errors={fieldErrors} name="pet_species" />
                </div>
                <div>
                  <label htmlFor="reg-sex" className={labelCls}>Gender</label>
                  <select id="reg-sex" required value={form.pet_sex}
                    onChange={set('pet_sex')} className={inputCls}>
                    <option value="">Select gender</option>
                    {PET_SEX.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <FieldError errors={fieldErrors} name="pet_sex" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label htmlFor="reg-weight" className={labelCls}>Weight (kg)</label>
                  <input id="reg-weight" type="number" min="0.1" max="999" step="0.1"
                    required value={form.pet_weight} onChange={set('pet_weight')}
                    placeholder="e.g. 8.5" className={inputCls} />
                  <FieldError errors={fieldErrors} name="pet_weight" />
                </div>
                <div>
                  <label htmlFor="reg-breed1" className={labelCls}>Primary breed</label>
                  <input id="reg-breed1" type="text" required value={form.pet_breed_primary}
                    onChange={set('pet_breed_primary')} placeholder="e.g. Beagle"
                    className={inputCls} />
                  <FieldError errors={fieldErrors} name="pet_breed_primary" />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="reg-breed2" className={labelCls}>
                  Secondary breed (optional)
                </label>
                <input id="reg-breed2" type="text" value={form.pet_breed_secondary}
                  onChange={set('pet_breed_secondary')} placeholder="For mixed-breed pets"
                  className={inputCls} />
              </div>

              {/* Password */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label htmlFor="reg-password" className={labelCls}>Password</label>
                  <div className="relative">
                    <input id="reg-password" type={showPass ? 'text' : 'password'}
                      autoComplete="new-password" required minLength={8}
                      value={form.password} onChange={set('password')}
                      placeholder="Value" className={inputCls} />
                    <button type="button" onClick={() => setShowPass((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPass ? <HiEyeOff className="h-3.5 w-3.5" /> : <HiEye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <FieldError errors={fieldErrors} name="password" />
                </div>
                <div>
                  <label htmlFor="reg-confirm" className={labelCls}>Confirm Password</label>
                  <div className="relative">
                    <input id="reg-confirm" type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password" required minLength={8}
                      value={form.confirm_password} onChange={set('confirm_password')}
                      placeholder="Value" className={inputCls} />
                    <button type="button" onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirm ? <HiEyeOff className="h-3.5 w-3.5" /> : <HiEye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <FieldError errors={fieldErrors} name="confirm_password" />
                </div>
              </div>

              {/* Privacy Policy */}
              <div className="flex items-center gap-2 mb-5">
                <input id="reg-privacy" type="checkbox" checked={form.privacy_policy}
                  onChange={set('privacy_policy')}
                  className="h-4 w-4 rounded border-gray-300 text-teal-400 focus:ring-teal-400" />
                <label htmlFor="reg-privacy" className="text-sm text-teal-100 select-none cursor-pointer">
                  I have read and agree to the{' '}
                  <span className="underline font-medium cursor-pointer">Privacy Policy</span>
                </label>
              </div>
              <FieldError errors={fieldErrors} name="privacy_policy" />

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  id="btn-register-submit"
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-full bg-teal-400 hover:bg-teal-300 text-teal-900 font-semibold py-2.5 text-sm transition disabled:opacity-60 disabled:cursor-not-allowed shadow"
                >
                  {loading ? 'Creating account…' : 'Accept'}
                </button>
                <Link
                  to={ROUTES.AUTH.LOGIN}
                  className="flex-1 rounded-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2.5 text-sm transition shadow text-center"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
