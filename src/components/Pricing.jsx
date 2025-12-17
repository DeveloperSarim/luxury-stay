import './Pricing.css';

const Pricing = () => {
  const images = [
    '68b1665569c44c318e76b796_pexels-heyho-7195591.avif',
    '68b166563d4e45b8e8e9c672_pexels-heyho-7195546.avif',
    '68b166558a43bcede42bb5ba_pexels-heyho-7195559.avif',
    '68b166550daef52c18e3ee50_pexels-heyho-7195577.avif',
    '68b16655c9bb3f24858f81ef_pexels-heyho-7195530.avif',
  ];

  return (
    <section id="pricing" className="pricing">
      <div className="w-layout-blockcontainer container big-container w-container">
        <div className="pricing-content">
          <div className="pricing-info">
            <div className="pricing-details">
              <div 
                data-wf-caption-variant="white" 
                className="caption w-variant-9b890bc9-fd07-e206-1d1f-f651a1a92481"
              >
                <div className="caption-shape w-variant-9b890bc9-fd07-e206-1d1f-f651a1a92481"></div>
                <div className="regular-s">Pricing</div>
              </div>
              <div className="regular-xl pricing-price">$290/night</div>
            </div>
            <p className="medium-m pricing-description">
              Absolutely no hidden charges. All extra costs already included.
            </p>
          </div>
          <div className="pricing-button">
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
          </div>
        </div>
      </div>
      
      <div className="images-ticket-wrapper">
        <div className="images-ticker">
          <div className="images-ticker-line">
            {images.map((img, idx) => (
              <img 
                key={idx}
                src={`/stayscape-images/${img}`}
                loading="lazy" 
                alt="" 
                className={`images-ticker-image ${idx === 1 ? 'big-vertical-image' : idx === 2 ? 'small-vertical-image' : 'square-image'}`}
              />
            ))}
          </div>
          <div className="images-ticker-line">
            {images.map((img, idx) => (
              <img 
                key={`dup-${idx}`}
                src={`/stayscape-images/${img}`}
                loading="lazy" 
                alt="" 
                className={`images-ticker-image ${idx === 1 ? 'big-vertical-image' : idx === 2 ? 'small-vertical-image' : 'square-image'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;

