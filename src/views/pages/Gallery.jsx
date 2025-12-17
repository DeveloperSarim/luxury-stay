import { Link } from 'react-router-dom';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import GalleryComponent from '../../components/Gallery';
import './Gallery.css';
import './PageLayout.css';

const Gallery = () => {
  return (
    <div className="page-wrapper gallery-page">
      <Nav />
      <div className="page-content">
        <section className="page-hero-section gallery-hero-section">
          <div className="page-container">
            <div className="page-hero-wrapper">
              <div 
                data-wf-caption-variant="black" 
                className="caption"
              >
                <div className="caption-shape"></div>
                <div className="regular-s">Gallery</div>
              </div>
              <h1 className="h1 page-hero-title">Inside Our Luxury Property</h1>
              <p className="medium-m page-hero-subtitle">
                Take a visual journey through our beautifully designed spaces, 
                each thoughtfully curated to provide the perfect ambiance for your stay.
              </p>
            </div>
          </div>
        </section>

        <GalleryComponent />

        <section className="page-section-large gallery-cta-section">
          <div className="page-container">
            <div className="gallery-cta-wrapper">
              <h2 className="h2">Ready to Experience It Yourself?</h2>
              <p className="medium-m gallery-cta-description">
                Book your stay and immerse yourself in luxury and comfort.
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

export default Gallery;

