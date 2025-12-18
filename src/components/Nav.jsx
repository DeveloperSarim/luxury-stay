import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Nav.css';

const Nav = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setMenuOpen(prev => !prev);
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
    setMenuOpen(false);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const navLinks = [
    { to: '/rooms', label: 'Rooms' },
    { to: '/services', label: 'Services' },
    { to: '/about', label: 'About' },
    { to: '/gallery', label: 'Gallery' },
    { to: '/features', label: 'Features' },
    { to: '/reviews', label: 'Reviews' },
    { to: '/location', label: 'Location' },
  ];

  return (
    <nav className={`custom-navbar ${scrolled ? 'scrolled' : ''} ${menuOpen ? 'menu-open' : ''}`} onClick={(e) => {
      if (e.target === e.currentTarget) {
        setMenuOpen(false);
      }
    }}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <img 
            src="/Luxury-Stay-Logo.png" 
            alt="Luxury Stay" 
            className="logo-image"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-links">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="navbar-actions">
          <a href="tel:+12125550199" className="nav-phone-btn" aria-label="Call us">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
          </a>
          
          {user ? (
            <>
              <Link to="/dashboard" className="nav-btn nav-btn-primary">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="nav-btn nav-btn-secondary">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="nav-btn nav-btn-primary">
              Login
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button 
            className={`mobile-menu-btn ${menuOpen ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen(prev => !prev);
            }}
            aria-label="Toggle menu"
            type="button"
            aria-expanded={menuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-content">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`mobile-nav-link ${location.pathname === link.to ? 'active' : ''}`}
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}
          
          <div className="mobile-menu-divider"></div>
          
          {user ? (
            <>
              <Link to="/dashboard" className="mobile-nav-link" onClick={closeMenu}>
                Dashboard
              </Link>
              <button onClick={handleLogout} className="mobile-nav-link mobile-logout-btn">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="mobile-nav-link mobile-login-btn" onClick={closeMenu}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Nav;
