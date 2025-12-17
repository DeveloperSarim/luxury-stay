import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.jsx';
import AdminDashboard from './views/AdminDashboard.jsx';
import AdminChat from './views/AdminChat.jsx';
import ReceptionOverview from './views/ReceptionDashboard.jsx';
import HousekeepingDashboard from './views/HousekeepingDashboard.jsx';
import MaintenanceDashboard from './views/MaintenanceDashboard.jsx';
import ReportsDashboard from './views/ReportsDashboard.jsx';
import Settings from './views/Settings.jsx';
import ReceptionGuests from './views/reception/ReceptionGuests.jsx';
import ReceptionReservations from './views/reception/ReceptionReservations.jsx';
import ReceptionRooms from './views/reception/ReceptionRooms.jsx';
import ReceptionBilling from './views/reception/ReceptionBilling.jsx';
import ReceptionServices from './views/reception/ReceptionServices.jsx';
import Login from './views/auth/Login.jsx';
import Register from './views/auth/Register.jsx';
import ForgotPassword from './views/auth/ForgotPassword.jsx';
import ResetPassword from './views/auth/ResetPassword.jsx';
import UserDashboard from './views/UserDashboard.jsx';
import Layout from './views/layout/Layout.jsx';
import Rooms from './views/pages/Rooms.jsx';
import Services from './views/pages/Services.jsx';
import About from './views/pages/About.jsx';
import Gallery from './views/pages/Gallery.jsx';
import Features from './views/pages/Features.jsx';
import Reviews from './views/pages/Reviews.jsx';
import Pricing from './views/pages/Pricing.jsx';
import Location from './views/pages/Location.jsx';
import { useAuth } from './context/AuthContext.jsx';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Loading...</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const RoleRoute = ({ roles, children }) => {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const Router = () => {
  const { user } = useAuth();

  const defaultDashboard =
    user?.role === 'user'
      ? 'user'
      : user?.role === 'receptionist'
        ? 'reception-overview'
        : user?.role === 'housekeeping'
          ? 'housekeeping'
          : user?.role === 'maintenance'
            ? 'maintenance'
            : 'admin';

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/features" element={<Features />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/location" element={<Location />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={<Navigate to={`/dashboard/${defaultDashboard}`} replace />}
          />
          {/* Backwards compatibility: old /dashboard/reception route */}
          <Route
            path="reception"
            element={<Navigate to="/dashboard/reception-overview" replace />}
          />
          <Route
            path="admin"
            element={
              <RoleRoute roles={['admin', 'manager']}>
                <AdminDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="admin-chat"
            element={
              <RoleRoute roles={['admin', 'manager']}>
                <AdminChat />
              </RoleRoute>
            }
          />
          <Route
            path="reception-overview"
            element={
              <RoleRoute roles={['admin', 'manager', 'receptionist']}>
                <ReceptionOverview />
              </RoleRoute>
            }
          />
          <Route
            path="reception-guests"
            element={
              <RoleRoute roles={['admin', 'manager', 'receptionist']}>
                <ReceptionGuests />
              </RoleRoute>
            }
          />
          <Route
            path="reception-reservations"
            element={
              <RoleRoute roles={['admin', 'manager', 'receptionist']}>
                <ReceptionReservations />
              </RoleRoute>
            }
          />
          <Route
            path="reception-rooms"
            element={
              <RoleRoute roles={['admin', 'manager', 'receptionist']}>
                <ReceptionRooms />
              </RoleRoute>
            }
          />
          <Route
            path="reception-billing"
            element={
              <RoleRoute roles={['admin', 'manager', 'receptionist']}>
                <ReceptionBilling />
              </RoleRoute>
            }
          />
          <Route
            path="reception-services"
            element={
              <RoleRoute roles={['admin', 'manager', 'receptionist']}>
                <ReceptionServices />
              </RoleRoute>
            }
          />
          <Route
            path="housekeeping"
            element={
              <RoleRoute roles={['admin', 'manager', 'housekeeping']}>
                <HousekeepingDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="maintenance"
            element={
              <RoleRoute roles={['admin', 'manager', 'maintenance']}>
                <MaintenanceDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="reports"
            element={
              <RoleRoute roles={['admin', 'manager']}>
                <ReportsDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="user"
            element={
              <RoleRoute roles={['user']}>
                <UserDashboard />
              </RoleRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;


