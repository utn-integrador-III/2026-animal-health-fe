import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  HiMenu,
  HiOutlineBell,
  HiOutlineLogout,
  HiOutlineUser,
} from 'react-icons/hi';

import animalHealthLogo from '../../assets/logos/LogoAnimalHealth.png';
import useAuthStore from '../../stores/useAuthStore';
import { ROUTES } from '../../constants/routes';

const NAVIGATION = {
  public: [
    { label: 'About Us', to: ROUTES.PUBLIC.ABOUT },
    { label: 'Our Services', to: ROUTES.PUBLIC.SERVICES },
    { label: 'Pets', to: ROUTES.AUTH.LOGIN },
    { label: 'Contact', to: ROUTES.PUBLIC.CONTACT },
  ],
  client: [
    { label: 'About Us', to: ROUTES.PUBLIC.ABOUT },
    { label: 'Our Services', to: ROUTES.PUBLIC.SERVICES },
    { label: 'Pets', to: ROUTES.CLIENT.DASHBOARD },
    { label: 'Contact', to: ROUTES.PUBLIC.CONTACT },
  ],
  veterinarian: [
    { label: 'Dashboard', to: ROUTES.VET.DASHBOARD },
  ],
};

export default function Navbar() {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const authStatus = useAuthStore((state) => state.authStatus);
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = authStatus === 'authenticated';
  const links = NAVIGATION[isAuthenticated ? role : 'public'] ?? NAVIGATION.public;
  const profileRoute = !isAuthenticated
    ? ROUTES.AUTH.LOGIN
    : role === 'veterinarian'
      ? ROUTES.VET.PROFILE
      : ROUTES.CLIENT.PROFILE;
  const homeRoute = !isAuthenticated
    ? ROUTES.AUTH.LOGIN
    : role === 'veterinarian'
      ? ROUTES.VET.DASHBOARD
      : ROUTES.CLIENT.DASHBOARD;
  const notificationCount = user?.unread_notifications ?? 0;

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    logout();
    navigate(ROUTES.AUTH.LOGIN, { replace: true });
  };

  const navLinkClass = ({ isActive }) => [
    'navbar-link',
    isActive ? 'navbar-link-active' : '',
  ].join(' ');

  return (
    <header className="app-navbar">
      <div className="app-navbar-inner">
        <NavLink
          to={homeRoute}
          className="navbar-brand"
          aria-label="Animal Health home"
        >
          <img
            src={animalHealthLogo}
            alt="Animal Health"
            className="h-16 w-16 object-contain sm:h-20 sm:w-20"
          />
        </NavLink>

        <nav className="navbar-navigation" aria-label="Main navigation">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar-account">
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              className="navbar-profile"
              onClick={() => setIsProfileMenuOpen((current) => !current)}
              aria-expanded={isProfileMenuOpen}
              aria-haspopup="menu"
            >
              <HiMenu className="text-xl" />
              <span className="hidden sm:inline">Profile</span>
              <span className="navbar-avatar">
                {user?.profile_image_url ? (
                  <img
                    src={user.profile_image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{user?.full_name?.charAt(0)?.toUpperCase() || 'U'}</span>
                )}
              </span>
            </button>

            {isProfileMenuOpen && (
              <div className="profile-menu" role="menu">
                {isAuthenticated ? (
                  <>
                    <div className="profile-menu-header">
                      <p className="font-semibold text-slate-900">{user?.full_name}</p>
                      <p className="truncate text-xs text-slate-500">{user?.email}</p>
                    </div>
                    <NavLink
                      to={profileRoute}
                      className="profile-menu-item"
                      role="menuitem"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <HiOutlineUser />
                      View and edit profile
                    </NavLink>
                    <button
                      type="button"
                      className="profile-menu-item w-full"
                      role="menuitem"
                      title={`${notificationCount} unread notifications`}
                    >
                      <HiOutlineBell />
                      <span className="flex-1 text-left">Notifications</span>
                      <span className="profile-notification-count">
                        {notificationCount}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="profile-menu-item w-full text-red-600"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      <HiOutlineLogout />
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <p className="profile-menu-header text-sm text-slate-600">
                      Log in to manage your profile and pets.
                    </p>
                    <NavLink
                      to={ROUTES.AUTH.LOGIN}
                      className="profile-menu-item"
                      role="menuitem"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <HiOutlineUser />
                      Log in
                    </NavLink>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
