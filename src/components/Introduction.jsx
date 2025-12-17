import './Introduction.css';

const Introduction = () => {
  return (
    <section className="introduction">
      <div className="w-layout-blockcontainer container w-container">
        <div className="introduction-content">
          <div className="introduction-heading">
            <div 
              data-wf-caption-variant="white" 
              className="caption w-variant-9b890bc9-fd07-e206-1d1f-f651a1a92481"
            >
              <div className="caption-shape w-variant-9b890bc9-fd07-e206-1d1f-f651a1a92481"></div>
              <div className="regular-s">Introduction</div>
            </div>
            <h2 className="h2 introduction-title">
              5th Avenue apartment in the heart of New York
            </h2>
          </div>
          
          <div className="introduction-info">
            <div id="w-node-_39c31a02-ef9e-bcde-88b8-2c549e720f53-c31b66ee" className="value-blocks">
              <div className="value-block">
                <div className="regular-xl value-block-number">200+</div>
                <div className="value-block-content">
                  <p className="medium-m value-block-description">
                    Happy guests accommodated
                  </p>
                  <img 
                    src="/stayscape-images/68adc88ead6ccc9a6c0733ae_SmileyWink.svg" 
                    loading="lazy" 
                    alt="" 
                    className="icon value-block-icon"
                  />
                </div>
              </div>
              
              <div className="value-blocks-divider"></div>
              
              <div className="value-block">
                <div className="regular-xl value-block-number">26%</div>
                <div className="value-block-content">
                  <p className="medium-m value-block-description">
                    Loyal repeat visitors hosted
                  </p>
                  <img 
                    src="/stayscape-images/68adc88ed4b1b16ee3e9198e_Users.svg" 
                    loading="lazy" 
                    alt="" 
                    className="icon value-block-icon"
                  />
                </div>
              </div>
              
              <div className="value-blocks-divider"></div>
              
              <div className="value-block">
                <div className="regular-xl value-block-number">24/7</div>
                <div className="value-block-content">
                  <p className="medium-m value-block-description">
                    Professional guest support
                  </p>
                  <img 
                    src="/stayscape-images/68adc88eed5e1efe46a84c02_Wrench.svg" 
                    loading="lazy" 
                    alt="" 
                    className="icon value-block-icon"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <img 
        src="/stayscape-images/68aee162cd5516fe1813c629_pexels-heyho-7195570_1.avif" 
        loading="lazy" 
        alt="Modern living room" 
        className="background-image parallax-image"
      />
    </section>
  );
};

export default Introduction;

