import './Offer.css';

const Offer = () => {
  return (
    <section className="offer">
      <div className="w-layout-blockcontainer container w-container">
        <div className="offer-content">
          <div className="offer-info">
            <div 
              data-wf-caption-variant="white" 
              className="caption w-variant-9b890bc9-fd07-e206-1d1f-f651a1a92481"
            >
              <div className="caption-shape w-variant-9b890bc9-fd07-e206-1d1f-f651a1a92481"></div>
              <div className="regular-s">Special Offer</div>
            </div>
            <h2 className="h2 offer-title">
              Book 30+ days ahead and enjoy 15% savings
            </h2>
          </div>
            <a 
              href="https://www.airbnb.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="white-button w-inline-block"
              data-wf-white-button-variant="primary"
            >
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
          </a>
          <div className="offer-overlay"></div>
          <img 
            src="/stayscape-images/68af1c93cb63694c6eaf9ddc_pexels-heyho-7195595.avif" 
            loading="lazy" 
            alt="Dining room" 
            className="background-image"
          />
        </div>
      </div>
    </section>
  );
};

export default Offer;

