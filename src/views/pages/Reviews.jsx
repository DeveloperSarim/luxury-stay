import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import ReviewsComponent from '../../components/Reviews';
import './Reviews.css';
import './PageLayout.css';

const Reviews = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    let timeoutId = null;

    const loadFeedbacks = async () => {
      try {
        setLoading(true);
        setError('');

        const controller = new AbortController();
        timeoutId = setTimeout(() => {
          controller.abort();
        }, 8000);

        const response = await fetch('http://localhost:5000/api/feedback', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Failed to load: ${response.status}`);
        }

        const data = await response.json();

        if (isMounted) {
          if (Array.isArray(data)) {
            setFeedbacks(data);
          } else {
            setFeedbacks([]);
          }
          setError('');
          setLoading(false);
        }
      } catch (err) {
        clearTimeout(timeoutId);
        
        if (isMounted) {
          if (err.name === 'AbortError') {
            setError('Request took too long. Please check your connection and try again.');
          } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
            setError('Cannot connect to server. Please make sure the backend is running.');
          } else {
            setError(err.message || 'Failed to load reviews. Please try again.');
          }
          setFeedbacks([]);
          setLoading(false);
        }
      }
    };

    loadFeedbacks();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <div className="page-wrapper reviews-page">
      <Nav />
      <div className="page-content">
        <section className="page-hero-section reviews-hero-section">
          <div className="page-container">
            <div className="page-hero-wrapper">
              <div 
                data-wf-caption-variant="black" 
                className="caption"
              >
                <div className="caption-shape"></div>
                <div className="regular-s">Reviews</div>
              </div>
              <h1 className="h1 page-hero-title">What Our Guests Say</h1>
              <p className="medium-m page-hero-subtitle">
                Read authentic reviews from our guests who have experienced 
                the luxury and comfort of staying with us.
              </p>
            </div>
          </div>
        </section>

        {loading ? (
          <section className="page-section reviews-loading-section">
            <div className="page-container big-container">
              <div className="reviews-loading-message">
                <div className="loading-spinner"></div>
                <p className="medium-m">Loading reviews...</p>
              </div>
            </div>
          </section>
        ) : error ? (
          <section className="page-section reviews-error-section">
            <div className="page-container big-container">
              <div className="reviews-error-message">
                <div className="error-icon">⚠️</div>
                <h3 className="h3">Unable to Load Reviews</h3>
                <p className="medium-m">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="reviews-retry-button"
                >
                  Retry
                </button>
              </div>
            </div>
          </section>
        ) : feedbacks.length > 0 ? (
          <section className="page-section reviews-backend-section">
            <div className="page-container big-container">
              <div className="reviews-backend-content">
                <div className="reviews-backend-header">
                  <div className="reviews-backend-rating">
                    <div className="regular-xl">
                      {(
                        feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length
                      ).toFixed(1)}
                    </div>
                    <div className="medium-xs">Average Rating</div>
                  </div>
                  <div className="reviews-backend-count">
                    <div className="regular-l">{feedbacks.length}</div>
                    <div className="medium-xs">Total Reviews</div>
                  </div>
                </div>
                <div className="reviews-backend-grid">
                  {feedbacks.map((feedback) => (
                    <div key={feedback._id} className="review-backend-card">
                      <div className="review-backend-header">
                        <div className="review-backend-info">
                          <div className="review-backend-name">
                            {feedback.guest?.firstName || 'Guest'} {feedback.guest?.lastName || ''}
                          </div>
                          <div className="review-backend-date">
                            {new Date(feedback.createdAt || Date.now()).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                        <div className="review-backend-rating">
                          <div className="medium-s">{feedback.rating || 5}</div>
                          <img 
                            src="/stayscape-images/68adc88e97b75eba13c5a1d1_Star.svg" 
                            loading="lazy"
                            alt=""
                            className="icon review-rating-icon"
                          />
                        </div>
                      </div>
                      {feedback.comment && (
                        <p className="medium-s review-backend-text">{feedback.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <ReviewsComponent />

        <section className="page-section-large reviews-cta-section">
          <div className="page-container">
            <div className="reviews-cta-wrapper">
              <h2 className="h2">Join Our Happy Guests</h2>
              <p className="medium-m reviews-cta-description">
                Book your stay and become part of our community of satisfied guests.
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
                <div className="medium-s button-text">Book Your Stay</div>
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Reviews;

