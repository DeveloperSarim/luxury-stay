import './About.css';

const About = () => {
  const leftFeatures = [
    { icon: '68adc88e591a81fed12cc109_Key.svg', text: 'Great check-in' },
    { icon: '68adc88e902a5d278c7f237e_SealCheck.svg', text: 'Responsive host' },
    { icon: '68adc88e8bb01a90c7437f27_Armchair.svg', text: 'Beautiful interior' },
    { icon: '68adc88e1f31e1e9f33be96c_Bed.svg', text: 'Comfortable beds' },
  ];

  const rightFeatures = [
    { icon: '68adc88ee5136917326b20a1_MapPinSimpleLine.svg', text: 'Great location' },
    { icon: '68adc88e591a81fed12cc101_Star-1.svg', text: 'Beautiful and walkable' },
    { icon: '68adc88ed7a35067ec7bbb95_Eyes.svg', text: 'Stunning views' },
    { icon: '68adc88ed2e2c254725cbff9_Image.svg', text: 'Scenic and peaceful' },
  ];

  return (
    <section id="about" className="about">
      <div className="w-layout-blockcontainer container big-container w-container">
        <div className="about-content">
          <div className="person-block">
            <div className="person-block-content">
              <div className="person-block-image-wrapper">
                <img 
                  src="/stayscape-images/68aefa9a474d7c66f0f99fa9_Benjamin Ross.avif" 
                  loading="lazy" 
                  alt="Benjamin Ross" 
                  className="person-block-image"
                />
                <div className="person-block-status">
                  <div className="person-block-status-circle"></div>
                </div>
              </div>
              <div className="person-block-info">
                <div className="medium-s">Benjamin Ross</div>
                <div className="medium-s person-block-description">Apartment Host</div>
              </div>
            </div>
            <a 
              href="tel:+12125550199" 
              className="icon-button w-variant-5486c117-8f56-ac61-d2f9-9007614520f0 w-inline-block"
              data-wf-icon-button-variant="small"
            >
              <img 
                src="/stayscape-images/68adc88e35a0c25f1799232d_PhoneCall.svg" 
                loading="lazy" 
                alt="Phone" 
                className="icon icon-button-icon w-variant-5486c117-8f56-ac61-d2f9-9007614520f0"
              />
            </a>
          </div>
          
          <p className="medium-m about-text">
            "Hi, I'm Benjamin. My sunny Upper East Side apartment sits beside Central Park, 
            with museums, cafes, and shops just a stroll away – your stylish home in the city."
          </p>
        </div>
      </div>
      
      <div className="ticker">
        <div className="ticker-item ticker-move-left">
          <div className="ticker-line move-left-line">
            {leftFeatures.map((feature, idx) => (
              <div key={idx} className="big-pill">
                <div className="big-pill-icon-wrapper">
                  <img 
                    src={`/stayscape-images/${feature.icon}`}
                    loading="lazy" 
                    alt="" 
                    className="icon big-pill-icon"
                  />
                </div>
                <div className="regular-l big-pill-text">{feature.text}</div>
              </div>
            ))}
          </div>
          <div className="ticker-line move-left-line">
            {leftFeatures.map((feature, idx) => (
              <div key={`dup-${idx}`} className="big-pill">
                <div className="big-pill-icon-wrapper">
                  <img 
                    src={`/stayscape-images/${feature.icon}`}
                    loading="lazy" 
                    alt="" 
                    className="icon big-pill-icon"
                  />
                </div>
                <div className="regular-l big-pill-text">{feature.text}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="ticker-item ticker-move-right">
          <div className="ticker-line move-right-line">
            {rightFeatures.map((feature, idx) => (
              <div key={idx} className="big-pill">
                <div className="big-pill-icon-wrapper">
                  <img 
                    src={`/stayscape-images/${feature.icon}`}
                    loading="lazy" 
                    alt="" 
                    className="icon big-pill-icon"
                  />
                </div>
                <div className="regular-l big-pill-text">{feature.text}</div>
              </div>
            ))}
          </div>
          <div className="ticker-line move-right-line">
            {rightFeatures.map((feature, idx) => (
              <div key={`dup-${idx}`} className="big-pill">
                <div className="big-pill-icon-wrapper">
                  <img 
                    src={`/stayscape-images/${feature.icon}`}
                    loading="lazy" 
                    alt="" 
                    className="icon big-pill-icon"
                  />
                </div>
                <div className="regular-l big-pill-text">{feature.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

