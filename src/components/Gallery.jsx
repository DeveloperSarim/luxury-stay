import './Gallery.css';

const Gallery = () => {
  const galleryItems = [
    { num: '01', title: 'Dining Room', img: '68af08e429f80a100d6e6fb8_pexels-heyho-7195560.avif', type: 'first-type' },
    { num: '02', title: 'Kitchen', img: '68af08e4f24a84bcdf5b01d7_pexels-heyho-7195593.avif', type: 'second-type' },
    { num: '03', title: 'Decorative Foyer', img: '68af08e47971d5aab88d4f6d_pexels-heyho-7195544.avif', type: 'third-type' },
    { num: '04', title: 'Bedroom', img: '68af0bb64ae82124a3d83aa9_pexels-heyho-7195583.avif', type: 'third-type' },
    { num: '05', title: 'Living Room', img: '68af0bb6d611ff8ef82abe7b_pexels-heyho-7195537.avif', type: 'third-type' },
    { num: '06', title: 'Home Office', img: '68af0bb654dcc6ae2da51409_pexels-heyho-7195524.avif', type: 'first-type fill' },
    { num: '07', title: 'Creative Workspace', img: '68af0d80259f4b3e804ee87d_pexels-heyho-7195521.avif', type: 'third-type' },
    { num: '08', title: 'Guest Bedroom', img: '68af0d804a580ad330c1c1d2_pexels-heyho-7195561.avif', type: 'first-type' },
    { num: '09', title: 'Bathroom', img: '68af0d802749a401537d6fb0_pexels-heyho-8142054.avif', type: 'fourth-type' },
  ];

  return (
    <section id="gallery" className="gallery">
      <div className="w-layout-blockcontainer container big-container w-container">
        <div className="gallery-content">
          <div className="section-heading-and-button">
            <div 
              data-wf-section-heading-variant="center-black" 
              className="section-heading"
            >
              <div data-wf-caption-variant="black" className="caption">
                <div className="caption-shape"></div>
                <div className="regular-s">Gallery</div>
              </div>
              <h2 className="h2 section-title">Inside the Cozy NYC Apartment</h2>
            </div>
            <a 
              href="https://www.airbnb.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="black-button w-inline-block"
              data-wf-black-button-variant="primary"
            >
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
            </a>
          </div>
          
          <div className="gallery-grid">
            {[0, 3, 6].map((startIdx) => (
              <div 
                key={startIdx} 
                className={`gallery-blocks ${startIdx === 0 ? 'w-node-_702e8fe2-07d4-23c6-b01a-1f0ec0b58be0-c31b66ee' : ''}`}
              >
                {galleryItems.slice(startIdx, startIdx + 3).map((item) => (
                  <div key={item.num} className={`gallery-block-wrapper ${item.type}`}>
                    <div className="gallery-block">
                      <div className="regular-xs">{item.num}</div>
                      <h3 className="h3">{item.title}</h3>
                      <div className="gallery-block-overlay"></div>
                      <img 
                        src={`/stayscape-images/${item.img}`}
                        loading="lazy" 
                        alt={item.title}
                        className="background-image"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Gallery;

