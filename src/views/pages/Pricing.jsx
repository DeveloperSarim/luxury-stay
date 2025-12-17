import { Link } from 'react-router-dom';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import PricingComponent from '../../components/Pricing';
import './Pricing.css';
import './PageLayout.css';

const Pricing = () => {
  return (
    <div className="page-wrapper pricing-page">
      <Nav />
      <div className="page-content">
        <section className="page-hero-section pricing-hero-section">
          <div className="page-container">
            <div className="page-hero-wrapper">
              <div 
                data-wf-caption-variant="black" 
                className="caption"
              >
                <div className="caption-shape"></div>
                <div className="regular-s">Pricing</div>
              </div>
              <h1 className="h1 page-hero-title">Transparent Pricing</h1>
              <p className="medium-m page-hero-subtitle">
                No hidden fees, no surprises. Our pricing is straightforward 
                and includes everything you need for a perfect stay.
              </p>
            </div>
          </div>
        </section>

        <PricingComponent />

        <section className="page-section-large pricing-cta-section">
          <div className="page-container">
            <div className="pricing-cta-wrapper">
              <h2 className="h2">Ready to Book?</h2>
              <p className="medium-m pricing-cta-description">
                View our rooms and find the perfect accommodation for your stay.
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
                <div className="medium-s button-text">View Rooms</div>
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Pricing;

