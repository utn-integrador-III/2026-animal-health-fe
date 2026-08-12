import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { HiLogout, HiMenu, HiUser } from 'react-icons/hi';

import animalHealthLogo from '../../assets/logos/LogoAnimalHealth.png';
import { ROUTES } from '../../constants/routes';
import { LANGUAGE_LABELS, LANGUAGES } from '../../i18n/translations';
import useLanguageStore from '../../stores/useLanguageStore';
import useTranslation from '../../hooks/useTranslation';
import useAuthStore from '../../stores/useAuthStore';
import NotificationBell from '../notifications/NotificationBell'; // ← NUEVO (IMPORT)

export default function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const authStatus = useAuthStore((state) => state.authStatus);
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const logout = useAuthStore((state) => state.logout);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const { language, t } = useTranslation();
  const isAuthenticated = authStatus === 'authenticated';
  const isClientArea = location.pathname.startsWith('/client');
  const isVetArea = location.pathname.startsWith('/vet');
  const isAdminArea = location.pathname.startsWith('/admin');
  const isAppArea = isClientArea || isVetArea || isAdminArea;
  const homeRoute = role === 'veterinarian'
    ? ROUTES.VET.DASHBOARD
    : role === 'admin'
      ? ROUTES.ADMIN.DASHBOARD
      : ROUTES.CLIENT.PETS;

  const displayName = user?.full_name ?? user?.name ?? user?.email ?? 'Client';
  const displayEmail = user?.email ?? 'Animal Health';
  const userInitial = displayName.trim().charAt(0).toUpperCase() || 'P';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current
        && !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.AUTH.LOGIN, { replace: true });
  };

  return (
    <header className="app-navbar">
<<<<<<< HEAD
      <nav className="app-navbar-inner">
        <Link
          to={isAuthenticated && isAppArea ? homeRoute : ROUTES.PUBLIC.ABOUT}
          className="navbar-brand"
          aria-label="Animal Health home"
        >
          <img
            src={animalHealthLogo}
            alt="Animal Health"
            className="navbar-logo"
          />
        </Link>

        {isAuthenticated && role === 'client' && isClientArea && (
          <div className="navbar-navigation" aria-label="Client navigation">
            <NavLink
              className={({ isActive }) => (isActive ? 'navbar-link navbar-link-active' : 'navbar-link')}
              to={ROUTES.PUBLIC.ABOUT}
            >
              {t('nav.about')}
            </NavLink>
            <NavLink
              className={({ isActive }) => (isActive ? 'navbar-link navbar-link-active' : 'navbar-link')}
              to={ROUTES.PUBLIC.SERVICES}
            >
              {t('nav.services')}
            </NavLink>
            <NavLink
              className={({ isActive }) => (isActive ? 'navbar-link navbar-link-active' : 'navbar-link')}
              to={ROUTES.CLIENT.PETS}
            >
              {t('nav.pets')}
            </NavLink>
            <NavLink
              className={({ isActive }) => (isActive ? 'navbar-link navbar-link-active' : 'navbar-link')}
              to={ROUTES.PUBLIC.CONTACT}
            >
              {t('nav.contact')}
            </NavLink>
          </div>
        )}

        {isAuthenticated && role === 'veterinarian' && isVetArea && (
          <div className="vet-navbar-navigation" aria-label="Veterinarian navigation">
            <NavLink
              className={({ isActive }) => (isActive ? 'vet-navbar-link vet-navbar-link-active' : 'vet-navbar-link')}
              to={ROUTES.VET.CONSULTATION}
            >
              {t('nav.consultation')}
            </NavLink>
            <NavLink
              className={({ isActive }) => (isActive ? 'vet-navbar-link vet-navbar-link-active' : 'vet-navbar-link')}
              to={ROUTES.VET.DASHBOARD}
            >
              {t('nav.patients')}
            </NavLink>
            <NavLink
              className={({ isActive }) => (isActive ? 'vet-navbar-link vet-navbar-link-active' : 'vet-navbar-link')}
              to={ROUTES.VET.REPORTS}
            >
              {t('nav.reports')}
            </NavLink>
          </div>
        )}

        <label className="navbar-language">
          <span>{t('nav.language')}</span>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            aria-label={t('nav.language')}
          >
            <option value={LANGUAGES.EN}>{LANGUAGE_LABELS[LANGUAGES.EN]}</option>
            <option value={LANGUAGES.ES}>{LANGUAGE_LABELS[LANGUAGES.ES]}</option>
          </select>
        </label>

        {!isAppArea && (
          <div className="navbar-navigation public-navbar-navigation" aria-label="Public navigation">
            <NavLink
              className={({ isActive }) => (isActive ? 'navbar-link navbar-link-active' : 'navbar-link')}
              to={ROUTES.PUBLIC.ABOUT}
            >
              {t('nav.about')}
            </NavLink>
            <NavLink
              className={({ isActive }) => (isActive ? 'navbar-link navbar-link-active' : 'navbar-link')}
              to={ROUTES.PUBLIC.SERVICES}
            >
              {t('nav.services')}
            </NavLink>
            <NavLink
              className={({ isActive }) => (isActive ? 'navbar-link navbar-link-active' : 'navbar-link')}
              to={ROUTES.PUBLIC.CONTACT}
            >
              {t('nav.contact')}
            </NavLink>
          </div>
        )}

        {!isAppArea && (
          <div className="navbar-auth-actions">
            <Link className="navbar-signup-link" to={ROUTES.AUTH.REGISTER}>
              {t('nav.signUp')}
            </Link>
            <Link className="navbar-login-link" to={ROUTES.AUTH.LOGIN}>
              {t('nav.signIn')}
            </Link>
          </div>
        )}

        {isAuthenticated && role !== 'client' && (isVetArea || isAdminArea) && (
          <button
            type="button"
            onClick={handleLogout}
            className={role === 'veterinarian' ? 'vet-signout-button' : 'font-medium text-teal-700'}
          >
            {t('nav.signOut')}
          </button>
        )}

        {isAuthenticated && role === 'client' && isClientArea && (
          <div className="flex items-center gap-4">
            
            <NotificationBell />

            <div className="navbar-account" ref={profileMenuRef}>
              <button
                type="button"
                className="navbar-profile-button"
                onClick={() => setIsProfileOpen((value) => !value)}
                aria-expanded={isProfileOpen}
                aria-haspopup="menu"
              >
                <HiMenu aria-hidden="true" />
                <span>{t('nav.profile')}</span>
                {user?.profile_image_url ? (
                  <img
                    className="navbar-avatar navbar-avatar-image"
                    src={user.profile_image_url}
                    alt={t('profile.photoAlt')}
                  />
                ) : (
                  <span className="navbar-avatar">{userInitial}</span>
                )}
              </button>

              {isProfileOpen && (
                <div className="profile-menu" role="menu">
                  <div className="profile-menu-header">
                    <p className="profile-menu-name">{displayName}</p>
                    <p className="profile-menu-email">{displayEmail}</p>
                  </div>
                  <Link
                    className="profile-menu-item"
                    to={ROUTES.CLIENT.PROFILE}
                    role="menuitem"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <HiUser aria-hidden="true" />
                    {t('nav.editProfile')}
                  </Link>
                  <button
                    type="button"
                    className="profile-menu-item profile-menu-item-danger"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    <HiLogout aria-hidden="true" />
                    {t('nav.logOut')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
=======
      <nav className="app-navbar-inner justify-between">
        <Link to={isAuthenticated ? homeRoute : ROUTES.AUTH.LOGIN} className="flex items-center gap-3">
          <img
            src={animalHealthLogo}
            alt="Animal Health"
            className="h-12 w-12 rounded-full bg-white object-contain"
          />
          <span className="text-lg font-bold text-slate-900">Animal Health</span>
        </Link>

        <div className="flex items-center gap-3">
          {!isAuthenticated && (
            <>
              <Link className="font-medium text-teal-700" to={ROUTES.AUTH.REGISTER}>
                Sign up
              </Link>
              <Link className="font-medium text-teal-700" to={ROUTES.AUTH.LOGIN}>
                Sign in
              </Link>
            </>
          )}
          {isAuthenticated && (
            <button
              type="button"
              onClick={handleLogout}
              className="font-medium text-teal-700"
            >
              Sign out
            </button>
          )}
        </div>
>>>>>>> origin/R2
      </nav>
    </header>
  );
}
