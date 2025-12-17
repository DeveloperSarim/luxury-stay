import { Link } from 'react-router-dom';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import LocationComponent from '../../components/Location';
import './Location.css';
import './PageLayout.css';

const Location = () => {
  return (
    <div className="page-wrapper location-page">
      <Nav />
      <div className="page-content">
        <section className="page-hero-section location-hero-section">
          <div className="page-container">
            <div className="page-hero-wrapper">
              <div 
                data-wf-caption-variant="black" 
                className="caption"
              >
                <div className="caption-shape"></div>
                <div className="regular-s">Location</div>
              </div>
              <h1 className="h1 page-hero-title">Where You'll Stay</h1>
              <p className="medium-m page-hero-subtitle">
                Discover our prime location in the heart of New York City, 
                perfectly positioned for exploring all the city has to offer.
              </p>
            </div>
          </div>
        </section>

        <LocationComponent />

        <section className="page-section-large location-cta-section">
          <div className="page-container">
            <div className="location-cta-wrapper">
              <h2 className="h2">Perfect Location Awaits</h2>
              <p className="medium-m location-cta-description">
                Book your stay and experience the best of New York City.
              </p>
              <Link to="/rooms" className="black-button w-inline-block">
                <div className="black-button-icon-wrapper">
                  <div className="button-icons">
                    <img 
                      src="/stayscape-images/68adc88e0d9ecf56a75aab0f_ArrowUpRight.svg"
                      loading="lazy"
                      alt=""
                      className="icon button-icon"
                    />
                    <img 
                      src="/stayscape-images/68aed3d0db1bb90e683bba6a_ArrowUpRight.svg"
                      loading="lazy"
                      alt=""
                      className="icon button-icon absolute-icon"
                    />
                  </div>
                </div>
                <div className="medium-s button-text">Book Now</div>
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Location;

