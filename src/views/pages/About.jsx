import { Link } from 'react-router-dom';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import AboutComponent from '../../components/About';
import './About.css';
import './PageLayout.css';

const About = () => {
  return (
    <div className="page-wrapper about-page">
      <Nav />
      <div className="page-content">
        <section className="page-hero-section about-hero-section">
          <div className="page-container">
            <div className="page-hero-wrapper">
              <div 
                data-wf-caption-variant="black" 
                className="caption"
              >
                <div className="caption-shape"></div>
                <div className="regular-s">About Us</div>
              </div>
              <h1 className="h1 page-hero-title">Welcome to Luxury Stay</h1>
              <p className="medium-m page-hero-subtitle">
                Experience the perfect blend of comfort, elegance, and exceptional 
                service in the heart of New York City.
              </p>
            </div>
          </div>
        </section>

        <AboutComponent />

        <section className="page-section about-story-section">
          <div className="page-container big-container">
            <div className="about-story-content">
              <div className="about-story-text">
                <h2 className="h2">Our Story</h2>
                <p className="medium-m">
                  Founded with a vision to redefine luxury hospitality, Luxury Stay 
                  has been providing exceptional accommodation experiences since our 
                  inception. Located in the prestigious Upper East Side, we offer 
                  guests a unique blend of modern comfort and timeless elegance.
                </p>
                <p className="medium-m">
                  Every detail of our property has been carefully curated to ensure 
                  your stay is nothing short of extraordinary. From our beautifully 
                  designed rooms to our world-class amenities, we strive to create 
                  memorable experiences for every guest.
                </p>
              </div>
              <div className="about-story-image">
                <img 
                  src="/stayscape-images/68aedb4f51c4fdbf6c074c38_pexels-heyho-7195529.avif"
                  alt="Luxury Stay Interior"
                  className="background-image"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="page-section about-values-section">
          <div className="page-container big-container">
            <div className="about-values-content">
              <div 
                data-wf-caption-variant="black" 
                className="caption"
              >
                <div className="caption-shape"></div>
                <div className="regular-s">Our Values</div>
              </div>
              <h2 className="h2 section-title">What Sets Us Apart</h2>
            
            <div className="values-grid">
              <div className="value-card">
                <div className="value-icon-wrapper">
                  <img 
                    src="/stayscape-images/68adc88e591a81fed12cc109_Key.svg"
                    alt=""
                    className="icon value-icon"
                  />
                </div>
                <h3 className="h3">Excellence</h3>
                <p className="medium-s">
                  We are committed to delivering excellence in every aspect of 
                  your stay, from check-in to check-out.
                </p>
              </div>
              
              <div className="value-card">
                <div className="value-icon-wrapper">
                  <img 
                    src="/stayscape-images/68adc88e902a5d278c7f237e_SealCheck.svg"
                    alt=""
                    className="icon value-icon"
                  />
                </div>
                <h3 className="h3">Authenticity</h3>
                <p className="medium-s">
                  Our genuine care and attention to detail create authentic 
                  experiences that resonate with our guests.
                </p>
              </div>
              
              <div className="value-card">
                <div className="value-icon-wrapper">
                  <img 
                    src="/stayscape-images/68adc88e1f31e1e9f33be96c_Bed.svg"
                    alt=""
                    className="icon value-icon"
                  />
                </div>
                <h3 className="h3">Comfort</h3>
                <p className="medium-s">
                  Your comfort is our priority. We ensure every element of your 
                  stay is designed for relaxation and peace of mind.
                </p>
              </div>
            </div>
            </div>
          </div>
        </section>

        <section className="page-section-large about-cta-section">
          <div className="page-container">
            <div className="about-cta-wrapper">
              <h2 className="h2">Ready to Experience Luxury?</h2>
              <p className="medium-m about-cta-description">
                Book your stay with us and discover what makes Luxury Stay special.
              </p>
            <div className="about-cta-buttons">
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
              <Link to="/" className="white-button w-inline-block">
                <div className="white-button-icon-wrapper">
                  <div className="button-icons">
                    <img 
                      src="/stayscape-images/68adc9265ad51e253d3e149f_ArrowUpRight.svg"
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
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default About;

