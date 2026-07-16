import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { HiBell, HiLogout, HiMenu, HiUser } from 'react-icons/hi';

import animalHealthLogo from '../../assets/logos/LogoAnimalHealth.png';
import { ROUTES } from '../../constants/routes';
import { LANGUAGE_LABELS, LANGUAGES } from '../../i18n/translations';
import useLanguageStore from '../../stores/useLanguageStore';
import useTranslation from '../../hooks/useTranslation';
import useAuthStore from '../../stores/useAuthStore';

export default function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();
  const authStatus = useAuthStore((state) => state.authStatus);
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const logout = useAuthStore((state) => state.logout);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const { language, t } = useTranslation();
  const isAuthenticated = authStatus === 'authenticated';
  const homeRoute = role === 'veterinarian'
    ? ROUTES.VET.DASHBOARD
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
      <nav className="app-navbar-inner">
        <Link
          to={isAuthenticated ? homeRoute : ROUTES.AUTH.LOGIN}
          className="navbar-brand"
          aria-label="Animal Health home"
        >
          <img
            src={animalHealthLogo}
            alt="Animal Health"
            className="navbar-logo"
          />
        </Link>

        {isAuthenticated && role === 'client' && (
          <div className="navbar-navigation" aria-label="Client navigation">
            <Link className="navbar-link" to={`${ROUTES.CLIENT.PETS}#about`}>
              {t('nav.about')}
            </Link>
            <Link className="navbar-link" to={`${ROUTES.CLIENT.PETS}#services`}>
              {t('nav.services')}
            </Link>
            <NavLink
              className={({ isActive }) => (isActive ? 'navbar-link navbar-link-active' : 'navbar-link')}
              to={ROUTES.CLIENT.PETS}
            >
              {t('nav.pets')}
            </NavLink>
            <Link className="navbar-link" to={`${ROUTES.CLIENT.PETS}#contact`}>
              {t('nav.contact')}
            </Link>
          </div>
        )}

        {isAuthenticated && role === 'veterinarian' && (
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

        {!isAuthenticated && (
          <div className="navbar-auth-actions">
            <Link className="font-medium text-teal-700" to={ROUTES.AUTH.REGISTER}>
              {t('nav.signUp')}
            </Link>
            <Link className="font-medium text-teal-700" to={ROUTES.AUTH.LOGIN}>
              {t('nav.signIn')}
            </Link>
          </div>
        )}

        {isAuthenticated && role !== 'client' && (
          <button
            type="button"
            onClick={handleLogout}
            className={role === 'veterinarian' ? 'vet-signout-button' : 'font-medium text-teal-700'}
          >
            {t('nav.signOut')}
          </button>
        )}

        {isAuthenticated && role === 'client' && (
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
                <button type="button" className="profile-menu-item" role="menuitem">
                  <HiBell aria-hidden="true" />
                  {t('nav.notifications')}
                  <span className="profile-notification-count">0</span>
                </button>
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
        )}
      </nav>
    </header>
  );
}
