import './Location.css';

const Location = () => {
  return (
    <section id="location" className="location">
      <div className="w-layout-blockcontainer container w-container">
        <div className="location-content">
          <div className="location-info">
            <div 
              data-wf-section-heading-variant="center-white" 
              className="section-heading w-variant-ea45a946-717b-1877-197d-32ffb16578e8"
            >
              <div 
                data-wf-caption-variant="white" 
                className="caption w-variant-9b890bc9-fd07-e206-1d1f-f651a1a92481"
              >
                <div className="caption-shape w-variant-9b890bc9-fd07-e206-1d1f-f651a1a92481"></div>
                <div className="regular-s">Location</div>
              </div>
              <h2 className="h2 section-title">Where You'll Stay</h2>
            </div>
            
            <div className="location-details">
              <div id="w-node-d2509726-09cd-497c-548c-5c5e61f0c87f-c31b66ee" className="caption-info-blocks">
                <div className="caption-info-block-wrapper first-block">
                  <div className="caption-info-block">
                    <p className="medium-s caption-info-block-name">Neighborhood:</p>
                    <p className="regular-m caption-info-block-value">Upper East Side, Manhattan</p>
                  </div>
                </div>
                <div className="caption-info-blocks-divider"></div>
                <div className="caption-info-block-wrapper second-block">
                  <div className="caption-info-block">
                    <p className="medium-s caption-info-block-name">Address:</p>
                    <p className="regular-m caption-info-block-value">953 5th Avenue, New York, USA</p>
                  </div>
                </div>
                <div className="caption-info-blocks-divider"></div>
                <div className="caption-info-block-wrapper third-block">
                  <div className="caption-info-block">
                    <p className="medium-s caption-info-block-name">Floor:</p>
                    <p className="regular-m caption-info-block-value">40th Floor With Elevator</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="map">
            <a 
              href="https://www.google.com/maps" 
              target="_blank" 
              rel="noopener noreferrer"
              className="icon-button w-inline-block"
              data-wf-icon-button-variant="big"
            >
              <img 
                src="/stayscape-images/68adc88e8dea64e9b2c159c5_TrafficSign.svg" 
                loading="lazy" 
                alt="Direction" 
                className="icon icon-button-icon"
              />
            </a>
            <div className="map-mark-wrapper">
              <div className="map-mark">
                <img 
                  src="/stayscape-images/68adc88e0d9ecf56a75aab2b_Buildings.svg" 
                  loading="lazy" 
                  alt="" 
                  className="icon map-mark-icon"
                />
                <div className="map-mark-shape"></div>
              </div>
            </div>
            <img 
              src="/stayscape-images/68b16f7e83d311c06ce2c781_Map.avif" 
              loading="lazy" 
              alt="Map" 
              className="background-image"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Location;

