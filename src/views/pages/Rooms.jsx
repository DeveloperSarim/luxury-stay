import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import './Rooms.css';
import './PageLayout.css';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    let timeoutId = null;

    const loadRooms = async () => {
      try {
        setLoading(true);
        setError('');

        // Simple fetch with timeout
        const controller = new AbortController();
        timeoutId = setTimeout(() => {
          controller.abort();
        }, 8000); // 8 second timeout

        const response = await fetch('http://localhost:5000/api/rooms', {
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
            setRooms(data);
          } else {
            setRooms([]);
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
            setError(err.message || 'Failed to load rooms. Please try again.');
          }
          setRooms([]);
          setLoading(false);
        }
      }
    };

    loadRooms();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const getStatusBadge = (status) => {
    const statusMap = {
      available: { text: 'Available', class: 'status-available' },
      occupied: { text: 'Occupied', class: 'status-occupied' },
      maintenance: { text: 'Maintenance', class: 'status-maintenance' },
      reserved: { text: 'Reserved', class: 'status-reserved' },
    };
    return statusMap[status] || { text: status, class: '' };
  };

  return (
    <div className="page-wrapper rooms-page">
      <Nav />
      <div className="page-content">
        <section className="page-hero-section rooms-hero-section">
          <div className="page-container">
            <div className="page-hero-wrapper">
              <div 
                data-wf-caption-variant="black" 
                className="caption"
              >
                <div className="caption-shape"></div>
                <div className="regular-s">Our Rooms</div>
              </div>
              <h1 className="h1 page-hero-title">Luxury Accommodations</h1>
              <p className="medium-m page-hero-subtitle">
                Experience unparalleled comfort in our beautifully designed rooms, 
                each thoughtfully curated for your perfect stay.
              </p>
            </div>
          </div>
        </section>

        <section className="page-section rooms-list-section">
          <div className="page-container big-container">
            {loading ? (
              <div className="rooms-loading-container">
                <div className="rooms-skeleton-grid">
                  {[1, 2, 3, 4, 5, 6].map((idx) => (
                    <div key={idx} className="room-skeleton-card">
                      <div className="skeleton-image"></div>
                      <div className="skeleton-content">
                        <div className="skeleton-line skeleton-title"></div>
                        <div className="skeleton-line skeleton-text"></div>
                        <div className="skeleton-line skeleton-text short"></div>
                        <div className="skeleton-button"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="rooms-error-container">
                <div className="rooms-error-message">
                  <div className="error-icon">⚠️</div>
                  <h3 className="h3">Unable to Load Rooms</h3>
                  <p className="medium-m">{error}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="rooms-retry-button"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : rooms.length === 0 ? (
              <div className="rooms-empty-container">
                <div className="rooms-empty-message">
                  <div className="empty-icon">🏨</div>
                  <h3 className="h3">No Rooms Available</h3>
                  <p className="medium-m">No rooms are currently available. Please check back later.</p>
                </div>
              </div>
            ) : (
              <div className="rooms-list-grid">
                {rooms.map((room) => {
                const statusBadge = getStatusBadge(room.status);
                return (
                  <div key={room._id} className="room-item-card">
                    <div className="room-item-image-container">
                      <div className="room-item-status-badge">
                        <span className={`room-status ${statusBadge.class}`}>
                          {statusBadge.text}
                        </span>
                      </div>
                      <img 
                        src="/stayscape-images/68af08e429f80a100d6e6fb8_pexels-heyho-7195560.avif"
                        alt={`Room ${room.roomNumber}`}
                        className="room-item-image"
                      />
                    </div>
                    <div className="room-item-info">
                      <div className="room-item-title-row">
                        <h3 className="h3 room-item-title">Room {room.roomNumber}</h3>
                        <span className="room-item-type">{room.type}</span>
                      </div>
                      <p className="medium-s room-item-desc">
                        {room.description || `Beautiful ${room.type.toLowerCase()} room with modern amenities.`}
                      </p>
                      <div className="room-item-details">
                        <div className="room-detail-item">
                          <img 
                            src="/stayscape-images/68adc88e1f31e1e9f33be96c_Bed.svg"
                            alt=""
                            className="icon room-detail-icon"
                          />
                          <span className="regular-xs">{room.capacity || 2} Guests</span>
                        </div>
                        <div className="room-detail-item">
                          <img 
                            src="/stayscape-images/68adc88e591a81fed12cc109_Key.svg"
                            alt=""
                            className="icon room-detail-icon"
                          />
                          <span className="regular-xs">${room.price || 290}/night</span>
                        </div>
                      </div>
                      {room.amenities && room.amenities.length > 0 && (
                        <div className="room-item-tags">
                          {room.amenities.slice(0, 3).map((amenity, idx) => (
                            <span key={idx} className="room-tag">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      )}
                      <Link 
                        to={room.status === 'available' ? '/login' : '#'}
                        className={`room-item-book-btn ${room.status !== 'available' ? 'room-item-book-btn-disabled' : ''}`}
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
                        <div className="medium-s button-text">
                          {room.status === 'available' ? 'Book Now' : 'Unavailable'}
                        </div>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Rooms;

