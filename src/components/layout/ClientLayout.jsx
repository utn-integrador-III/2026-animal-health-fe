import { Link, Outlet, useNavigate } from 'react-router-dom';
import { HiLogout } from 'react-icons/hi';

import animalHealthLogo from '../../assets/logos/LogoAnimalHealth.png';
import { ROUTES } from '../../constants/routes';
import useAuthStore from '../../stores/useAuthStore';
import Button from '../common/Button';

export default function ClientLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.AUTH.LOGIN, { replace: true });
  };

  return (
    <div className="app-shell">
      <header className="app-navbar">
        <div className="app-navbar-inner justify-between">
          <Link to={ROUTES.CLIENT.PETS} className="flex items-center gap-3">
            <img
              src={animalHealthLogo}
              alt="Animal Health"
              className="h-12 w-12 rounded-full bg-white object-contain"
            />
            <div>
              <p className="text-lg font-bold text-slate-900">Animal Health</p>
              <p className="text-xs font-medium text-teal-700">
                {user?.full_name ?? user?.email ?? 'Client portal'}
              </p>
            </div>
          </Link>

          <Button variant="ghost" onClick={handleLogout}>
            <HiLogout />
            Sign out
          </Button>
        </div>
      </header>

      <div className="app-content">
        <Outlet />
      </div>
    </div>
  );
}
