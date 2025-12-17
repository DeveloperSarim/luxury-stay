import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="simple-footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>Luxury Stay</h3>
            <p>Your perfect NYC experience starts here</p>
          </div>
          
          <div className="footer-links">
            <div className="footer-column">
              <h4>Quick Links</h4>
              <Link to="/rooms">Rooms</Link>
              <Link to="/services">Services</Link>
              <Link to="/about">About</Link>
              <Link to="/gallery">Gallery</Link>
            </div>
            
            <div className="footer-column">
              <h4>Information</h4>
              <Link to="/features">Features</Link>
              <Link to="/reviews">Reviews</Link>
              <Link to="/location">Location</Link>
            </div>
            
            <div className="footer-column">
              <h4>Contact</h4>
              <a href="mailto:help@luxurystay.com">help@luxurystay.com</a>
              <a href="tel:+12125550199">+1 (212) 555-0199</a>
              <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer">
                953 5th Ave, NYC
              </a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 Luxury Stay. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
