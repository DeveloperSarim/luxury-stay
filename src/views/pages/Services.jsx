import { Link } from 'react-router-dom';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import './Services.css';
import './PageLayout.css';

const Services = () => {
  const services = [
    {
      icon: '68adc88e591a81fed12cc109_Key.svg',
      title: '24/7 Concierge',
      description: 'Round-the-clock assistance for all your needs and inquiries.',
    },
    {
      icon: '68adc88e902a5d278c7f237e_SealCheck.svg',
      title: 'Room Service',
      description: 'Premium dining delivered directly to your room.',
    },
    {
      icon: '68adc88e8bb01a90c7437f27_Armchair.svg',
      title: 'Spa & Wellness',
      description: 'Relax and rejuvenate with our luxury spa treatments.',
    },
    {
      icon: '68adc88e1f31e1e9f33be96c_Bed.svg',
      title: 'Housekeeping',
      description: 'Daily housekeeping service to keep your space pristine.',
    },
    {
      icon: '68adc88ee5136917326b20a1_MapPinSimpleLine.svg',
      title: 'Airport Transfer',
      description: 'Complimentary airport pickup and drop-off service.',
    },
    {
      icon: '68adc88ed7a35067ec7bbb95_Eyes.svg',
      title: 'Tour Guide',
      description: 'Expert local guides for personalized city tours.',
    },
  ];

  return (
    <div className="page-wrapper services-page">
      <Nav />
      <div className="page-content">
        <section className="page-hero-section services-hero-section">
          <div className="page-container">
            <div className="page-hero-wrapper">
              <div 
                data-wf-caption-variant="black" 
                className="caption"
              >
                <div className="caption-shape"></div>
                <div className="regular-s">Our Services</div>
              </div>
              <h1 className="h1 page-hero-title">Luxury Services & Amenities</h1>
              <p className="medium-m page-hero-subtitle">
                Experience world-class hospitality with our comprehensive range 
                of premium services designed to make your stay unforgettable.
              </p>
            </div>
          </div>
        </section>

        <section className="page-section services-list-section">
          <div className="page-container big-container">
            <div className="services-grid">
              {services.map((service, idx) => (
              <div key={idx} className="service-card">
                <div className="service-card-icon-wrapper">
                  <img 
                    src={`/stayscape-images/${service.icon}`}
                    alt={service.title}
                    className="service-card-icon"
                  />
                </div>
                <h3 className="h3 service-card-title">{service.title}</h3>
                <p className="medium-s service-card-description">
                  {service.description}
                </p>
              </div>
              ))}
            </div>
          </div>
        </section>

        <section className="page-section-large services-cta-section">
          <div className="page-container">
            <div className="services-cta-wrapper">
              <h2 className="h2">Ready to Experience Luxury?</h2>
              <p className="medium-m services-cta-description">
                Book your stay now and enjoy all our premium services.
              </p>
            <Link to="/" className="black-button w-inline-block">
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
              <div className="medium-s button-text">Reserve Now</div>
            </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Services;

