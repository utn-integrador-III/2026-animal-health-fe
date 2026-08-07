import { Outlet } from 'react-router-dom';

import Navbar from './Navbar';
import Footer from './Footer';

export default function AdminLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="app-content">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
