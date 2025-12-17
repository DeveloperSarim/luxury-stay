import { Link } from 'react-router-dom';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import FeaturesComponent from '../../components/Features';
import './Features.css';
import './PageLayout.css';

const Features = () => {
  return (
    <div className="page-wrapper features-page">
      <Nav />
      <div className="page-content">
        <section className="page-hero-section features-hero-section">
          <div className="page-container">
            <div className="page-hero-wrapper">
              <div 
                data-wf-caption-variant="black" 
                className="caption"
              >
                <div className="caption-shape"></div>
                <div className="regular-s">Features</div>
              </div>
              <h1 className="h1 page-hero-title">Home Highlights & Amenities</h1>
              <p className="medium-m page-hero-subtitle">
                Discover all the features and amenities that make your stay 
                comfortable, convenient, and truly memorable.
              </p>
            </div>
          </div>
        </section>

        <FeaturesComponent />

        <section className="page-section-large features-cta-section">
          <div className="page-container">
            <div className="features-cta-wrapper">
              <h2 className="h2">Experience All Features</h2>
              <p className="medium-m features-cta-description">
                Book your stay and enjoy all our premium amenities.
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

export default Features;

