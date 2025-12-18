import { Outlet, NavLink, useLocation } from 'react-router-dom';
import './Layout.css';
import { useAuth } from '../../context/AuthContext.jsx';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { to: '/dashboard/user', label: 'My Dashboard', roles: ['user'] },
    { to: '/dashboard/admin', label: 'Admin', roles: ['admin', 'manager'] },
    { to: '/dashboard/admin-chat', label: 'Live Chat', roles: ['admin', 'manager'] },
    {
      to: '/dashboard/reception-overview',
      label: 'Overview',
      roles: ['admin', 'manager', 'receptionist'],
    },
    {
      to: '/dashboard/reception-guests',
      label: 'Guests',
      roles: ['admin', 'manager', 'receptionist'],
    },
    {
      to: '/dashboard/reception-reservations',
      label: 'Reservations',
      roles: ['admin', 'manager', 'receptionist'],
    },
    {
      to: '/dashboard/reception-rooms',
      label: 'Rooms',
      roles: ['admin', 'manager', 'receptionist'],
    },
    {
      to: '/dashboard/reception-billing',
      label: 'Billing',
      roles: ['admin', 'manager', 'receptionist'],
    },
    {
      to: '/dashboard/reception-services',
      label: 'Services',
      roles: ['admin', 'manager', 'receptionist'],
    },
    {
      to: '/dashboard/housekeeping',
      label: 'Housekeeping',
      roles: ['admin', 'manager', 'housekeeping'],
    },
    {
      to: '/dashboard/maintenance',
      label: 'Maintenance',
      roles: ['admin', 'manager', 'maintenance'],
    },
    { to: '/dashboard/reports', label: 'Reports', roles: ['admin', 'manager'] },
    { to: '/dashboard/settings', label: 'Settings', roles: ['admin', 'manager', 'receptionist', 'housekeeping', 'maintenance', 'user'] },
  ];

  // Get current page name
  const currentPage = navItems.find(item => item.to === location.pathname);
  const pageTitle = currentPage ? currentPage.label : 'Dashboard';

  return (
    <div className="hms-layout">
      <aside className="hms-sidebar">
        <div className="hms-logo">
          <img 
            src="/Luxury-Stay-Logo.png" 
            alt="LuxuryStay HMS" 
            className="sidebar-logo"
            onError={(e) => {
              // Fallback to Luxury-Stay-Logo.png if logo.png fails
              e.target.src = '/Luxury-Stay-Logo.png';
              e.target.onerror = () => {
                // Final fallback to text
                e.target.style.display = 'none';
                const textFallback = e.target.nextElementSibling;
                if (textFallback) textFallback.style.display = 'block';
              };
            }}
          />
          <span style={{ display: 'none' }}>LuxuryStay HMS</span>
        </div>
        <nav>
          {navItems
            .filter((item) => !user || item.roles.includes(user.role))
            .map((item) => (
              <NavLink key={item.to} to={item.to}>
                {item.label}
              </NavLink>
            ))}
        </nav>
      </aside>
      <div className="hms-main">
        <header className="hms-topbar">
          <h1>{pageTitle}</h1>
          <div className="user-info">
            <span>{user?.name}</span>
            <span className="role-pill">{user?.role}</span>
            <button type="button" onClick={logout} className="logout-btn">
              Logout
            </button>
          </div>
        </header>
        <main className="hms-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;


