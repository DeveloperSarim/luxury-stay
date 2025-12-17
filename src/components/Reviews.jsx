import './Reviews.css';

const Reviews = () => {
  const reviews = [
    { name: 'Andrew K.', location: 'Zwolle, Netherlands', img: '68b1541ea146667517f34f9a_Andrew K..avif', text: 'Felt like a true home away from home! The apartment was spotless, beautifully decorated, and just steps from Central Park. The host was super responsive – I\'d definitely stay again.', date: 'Aug 28, 2025' },
    { name: 'Lina S.', location: 'Berlin, Germany', img: '68b1541e0bb057d0b74f730c_Lina S..avif', text: 'Perfect spot for exploring lively New York! Central Park is minutes away, the subway close, and the apartment was cozy and stylish. Love it!', date: 'Aug 13, 2025' },
    { name: 'William N.', location: 'Paphos, Cyprus', img: '68b1541ec891d0fa1c56a790_William N..avif', text: 'Stylish apartment with everything I needed. The host was quick to respond, making check-in super easy. Would recommend to anyone in New York.', date: 'Jul 20, 2025' },
    { name: 'Patrick T.', location: 'Warsaw, Poland', img: '68b1541e90a6e7759fb1eccf_Patrick T..avif', text: 'Amazing location on 5th Avenue! Central Park is a short walk away, and the apartment was safe, clean, and welcoming. The stylish design made it a perfect base to explore the city – truly a gem!', date: 'Jul 03, 2025' },
    { name: 'Sofia W.', location: 'Rome, Italy', img: '68b1541e664aeb75a3835bab_Sofia W..avif', text: 'Such a comfortable stay! The beds were great, the apartment was quiet, and the host made check-in super easy. With a 100% response rate, communication was smooth and stress-free. Can\'t wait to return again soon!', date: 'Jun 08, 2025' },
    { name: 'Julian M.', location: 'Havana, Cuba', img: '68b1541ea146667517f34f97_Julian M..avif', text: 'Fantastic stay! Cozy, spotless, and perfectly located. The photos don\'t do it justice – it\'s even better in person. Everything was so comfortable and well-prepared, and I\'ll definitely be back.', date: 'May 17, 2025' },
    { name: 'Inessa J.', location: 'Vienna, Austria', img: '68b1541e627dd85661f7583e_Inessa J..avif', text: 'Great value for the location. Comfortable beds, modern decor, and the subway is so close by. Ideal choice for a weekend in the city.', date: 'Apr 10, 2025' },
    { name: 'Michael B.', location: 'Porto, Portugal', img: '68b1541e88243f69605f23fd_Michael B..avif', text: 'Superhost service all the way. The place was beautiful, communication was instant, and I felt right at home from the start. The atmosphere was so welcoming. Five stars without a doubt!', date: 'Mar 17, 2025' },
    { name: 'Scarlett A.', location: 'Dublin, Ireland', img: '68b15685b0d868816c62e655_Scarlett A..avif', text: 'Wonderful stay in the heart of New York! The apartment was spotless, cozy, and had everything I needed. The host was friendly and responsive, which made the whole trip stress-free.', date: 'Feb 05, 2025' },
  ];

  const columns = [
    reviews.slice(0, 3),
    reviews.slice(3, 6),
    reviews.slice(6, 9),
  ];

  return (
    <section id="reviews" className="reviews">
      <div className="w-layout-blockcontainer container big-container w-container">
        <div className="reviews-content">
          <div className="reviews-info">
            <div className="reviews-details">
              <div className="reviews-caption-and-rating">
                <div data-wf-caption-variant="black" className="caption">
                  <div className="caption-shape"></div>
                  <div className="regular-s">Reviews</div>
                </div>
                <div className="reviews-rating">
                  <img 
                    src="/stayscape-images/68adc88ecb304dc88d339c88_Wreath-Left.svg" 
                    loading="lazy" 
                    alt="" 
                    className="reviews-rating-icon"
                  />
                  <div className="regular-xl">4.98</div>
                  <img 
                    src="/stayscape-images/68adc88e0cc8b26eadb21e5b_Wreath-Right.svg" 
                    loading="lazy" 
                    alt="" 
                    className="reviews-rating-icon"
                  />
                </div>
              </div>
              <p className="medium-m reviews-description">
                We're proud to deliver a stay that guests consistently love.
              </p>
            </div>
            
            <div className="small-review-blocks">
              <div className="small-review-block-wrapper first-block">
                <div className="small-review-block">
                  <div className="medium-m">4.9</div>
                  <div className="medium-xs small-review-block-description">Cleanliness</div>
                </div>
              </div>
              <div className="small-review-blocks-divider"></div>
              <div className="small-review-block-wrapper second-block">
                <div className="small-review-block">
                  <div className="medium-m">5.0</div>
                  <div className="medium-xs small-review-block-description">Accuracy</div>
                </div>
              </div>
              <div className="small-review-blocks-divider mobile-hide"></div>
              <div className="small-review-block-wrapper third-block">
                <div className="small-review-block">
                  <div className="medium-m">5.0</div>
                  <div className="medium-xs small-review-block-description">Check-in</div>
                </div>
              </div>
              <div className="small-review-blocks-divider"></div>
              <div className="small-review-block-wrapper fourth-block">
                <div className="small-review-block">
                  <div className="medium-m">5.0</div>
                  <div className="medium-xs small-review-block-description">Communication</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="review-blocks-wrapper">
            <div className="review-blocks">
              {columns.map((column, colIdx) => (
                <div key={colIdx} className="review-blocks-column">
                  {column.map((review, idx) => (
                    <div key={idx} className="review-block">
                      <div className="review-block-content">
                        <div className="review-block-info">
                          <img 
                            src={`/stayscape-images/${review.img}`}
                            loading="lazy" 
                            alt={review.name}
                            className="review-block-image"
                          />
                          <div className="review-block-attribution">
                            <div className="medium-s">{review.name}</div>
                            <div className="medium-xs review-block-description">{review.location}</div>
                          </div>
                        </div>
                        <div className="review-block-rating">
                          <div className="medium-xs">5.0</div>
                          <img 
                            src="/stayscape-images/68adc88e97b75eba13c5a1d1_Star.svg" 
                            loading="lazy" 
                            alt="" 
                            className="icon review-block-rating-icon"
                          />
                        </div>
                      </div>
                      <p className="medium-s review-block-text">{review.text}</p>
                      <div className="medium-xs review-block-date">{review.date}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          
            <a 
              href="https://www.airbnb.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="black-button w-variant-d972b4a4-052a-c714-9106-c658d02bd590 w-inline-block"
              data-wf-black-button-variant="secondary"
            >
              <div className="black-button-icon-wrapper w-variant-d972b4a4-052a-c714-9106-c658d02bd590">
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
                <div className="medium-s button-text w-variant-d972b4a4-052a-c714-9106-c658d02bd590">View All</div>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Reviews;

