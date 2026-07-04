import { Link, useNavigate } from 'react-router-dom';

import animalHealthLogo from '../../assets/logos/LogoAnimalHealth.png';
import { ROUTES } from '../../constants/routes';
import useAuthStore from '../../stores/useAuthStore';

export default function Navbar() {
  const navigate = useNavigate();
  const authStatus = useAuthStore((state) => state.authStatus);
  const role = useAuthStore((state) => state.role);
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = authStatus === 'authenticated';
  const homeRoute = role === 'veterinarian'
    ? ROUTES.VET.DASHBOARD
    : ROUTES.CLIENT.PETS;

  const handleLogout = () => {
    logout();
    navigate(ROUTES.AUTH.LOGIN, { replace: true });
  };

  return (
    <header className="app-navbar">
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
      </nav>
    </header>
  );
}
