import { useEffect, useState } from 'react';
import './Dashboard.css';
import { useApiClient } from '../utils/apiClient.js';
import { useAuth } from '../context/AuthContext.jsx';
import { validateName, validateEmail, validatePhone, validateDate, validateDateRange, validateNumber } from '../utils/validations.js';

const UserDashboard = () => {
  const { apiFetch } = useApiClient();
  const { user } = useAuth();
  const [myBookings, setMyBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings', 'new-booking', 'chat'
  
  // New booking form
  const [bookingForm, setBookingForm] = useState({
    room: '',
    checkInDate: '',
    checkOutDate: '',
    numGuests: 1,
    notes: ''
  });
  const [bookingFormErrors, setBookingFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      const [bookings, roomsList] = await Promise.all([
        apiFetch('/api/reservations/my-bookings'),
        apiFetch('/api/rooms?status=available'),
      ]);
      setMyBookings(bookings || []);
      setRooms(roomsList || []);
    } catch (err) {
      console.error('Load data error:', err);
      // Only show error if it's not a network/timeout error
      if (err.message && !err.message.includes('timeout') && !err.message.includes('Failed to fetch')) {
        setError(err.message);
      } else {
        setError(''); // Clear error for network issues
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBookingFormChange = (field, value) => {
    setBookingForm({ ...bookingForm, [field]: value });
    
    // Real-time validation
    let fieldError = '';
    if (field === 'room') {
      fieldError = value ? '' : 'Room select karein';
    } else if (field === 'checkInDate') {
      fieldError = validateDate(value, 'Check-in Date');
    } else if (field === 'checkOutDate') {
      fieldError = validateDate(value, 'Check-out Date');
      if (!fieldError && bookingForm.checkInDate) {
        fieldError = validateDateRange(bookingForm.checkInDate, value, 'Check-in Date', 'Check-out Date');
      }
    } else if (field === 'numGuests') {
      fieldError = validateNumber(value, 'Number of Guests', 1, 20);
    }
    
    setBookingFormErrors({ ...bookingFormErrors, [field]: fieldError });
    
    // Re-validate check-out date if check-in date changes
    if (field === 'checkInDate' && bookingForm.checkOutDate) {
      const checkOutError = validateDateRange(value, bookingForm.checkOutDate, 'Check-in Date', 'Check-out Date');
      setBookingFormErrors({ ...bookingFormErrors, [field]: fieldError, checkOutDate: checkOutError });
    }
  };

  const handleNewBooking = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate all fields
    const roomError = bookingForm.room ? '' : 'Room select karein';
    const checkInError = validateDate(bookingForm.checkInDate, 'Check-in Date');
    const checkOutError = validateDate(bookingForm.checkOutDate, 'Check-out Date');
    const dateRangeError = checkInError || checkOutError ? '' : validateDateRange(bookingForm.checkInDate, bookingForm.checkOutDate, 'Check-in Date', 'Check-out Date');
    const numGuestsError = validateNumber(bookingForm.numGuests, 'Number of Guests', 1, 20);
    
    const newErrors = {
      room: roomError,
      checkInDate: checkInError,
      checkOutDate: checkOutError || dateRangeError,
      numGuests: numGuestsError,
    };
    
    setBookingFormErrors(newErrors);
    
    if (roomError || checkInError || checkOutError || dateRangeError || numGuestsError) {
      return;
    }
    
    setSubmitting(true);
    try {
      await apiFetch('/api/reservations', {
        method: 'POST',
        body: JSON.stringify(bookingForm),
      });
      setBookingForm({
        room: '',
        checkInDate: '',
        checkOutDate: '',
        numGuests: 1,
        notes: ''
      });
      setBookingFormErrors({});
      setActiveTab('bookings');
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Toast notification function
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'info' });
    }, 3000);
  };

  const downloadDigitalCard = async (bookingId) => {
    try {
      setError('');
      
      // Show generating toast
      showToast('Digital card generate ho raha hai...', 'info');
      
      // Get booking details
      const booking = myBookings.find(b => b._id === bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      // Get QR code from backend
      const qrData = await apiFetch(`/api/reservations/${bookingId}/qr-code`);
      if (!qrData || !qrData.qrCode) {
        throw new Error('QR code generate nahi ho saka');
      }

      // Load SVG template
      const svgResponse = await fetch('/Digital Card.svg');
      let svgText = await svgResponse.text();

      // Use QR code data URL from backend
      const qrCodeDataUrl = qrData.qrCode;

      // Get booking details
      const guestName = booking.guest 
        ? `${booking.guest.firstName || ''} ${booking.guest.lastName || ''}`.trim() 
        : user?.name || 'Guest';
      const guestEmail = booking.guest?.email || user?.email || '';
      const guestPhone = booking.guest?.phone || user?.phone || '';
      const roomNumber = booking.room?.roomNumber || 'N/A';
      const checkIn = new Date(booking.checkInDate).toLocaleDateString('en-GB');
      const checkOut = new Date(booking.checkOutDate).toLocaleDateString('en-GB');

      // Replace QR code image in SVG
      svgText = svgText.replace(
        /<image[^>]*id="qr-code"[^>]*>/i,
        `<image id="qr-code" x="275" y="150" width="250" height="250" href="${qrCodeDataUrl}" preserveAspectRatio="xMidYMid meet"/>`
      );

      // Replace text content - multiple methods to ensure replacement
      // Method 1: Replace by ID attribute with full text element
      svgText = svgText.replace(
        /<text[^>]*id="guest-name"[^>]*>Guest Name<\/text>/i,
        `<text x="80" y="175" id="guest-name" font-size="18" fill="#111827">${guestName}</text>`
      );
      svgText = svgText.replace(
        /<text[^>]*id="guest-email"[^>]*>guest@example\.com<\/text>/i,
        `<text x="80" y="245" id="guest-email" font-size="18" fill="#111827">${guestEmail}</text>`
      );
      svgText = svgText.replace(
        /<text[^>]*id="guest-phone"[^>]*>\+92 300 1234567<\/text>/i,
        `<text x="80" y="315" id="guest-phone" font-size="18" fill="#111827">${guestPhone || 'N/A'}</text>`
      );
      svgText = svgText.replace(
        /<text[^>]*id="room-number"[^>]*>Room 101<\/text>/i,
        `<text x="80" y="385" id="room-number" font-size="18" fill="#111827">Room ${roomNumber}</text>`
      );
      svgText = svgText.replace(
        /<text[^>]*id="check-in-date"[^>]*>01\/01\/2024<\/text>/i,
        `<text x="600" y="385" id="check-in-date" font-size="18" fill="#111827">${checkIn}</text>`
      );
      svgText = svgText.replace(
        /<text[^>]*id="check-out-date"[^>]*>05\/01\/2024<\/text>/i,
        `<text x="600" y="445" id="check-out-date" font-size="18" fill="#111827">${checkOut}</text>`
      );
      
      // Method 2: Direct text replacement (fallback)
      svgText = svgText.replace(/Guest Name/g, guestName);
      svgText = svgText.replace(/guest@example\.com/g, guestEmail);
      svgText = svgText.replace(/\+92 300 1234567/g, guestPhone || 'N/A');
      svgText = svgText.replace(/Room 101/g, `Room ${roomNumber}`);
      svgText = svgText.replace(/01\/01\/2024/g, checkIn);
      svgText = svgText.replace(/05\/01\/2024/g, checkOut);

      // Convert SVG to canvas first, then to image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      // Set canvas size
      canvas.width = 800;
      canvas.height = 500;
      
      // Create SVG data URL with proper encoding
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const reader = new FileReader();
      
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Image conversion timeout'));
        }, 15000); // 15 second timeout
        
        reader.onload = () => {
          const svgDataUrl = reader.result;
          
          img.onload = () => {
            clearTimeout(timeout);
            try {
              // Draw SVG to canvas
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              
              // Convert canvas to image data URL
              const canvasDataUrl = canvas.toDataURL('image/png');
              
              // Generate PDF using jsPDF
              import('jspdf').then(({ jsPDF }) => {
                try {
                  const doc = new jsPDF({
                    orientation: 'landscape',
                    unit: 'mm',
                    format: [210, 148] // A5 landscape
                  });

                  // Calculate dimensions to fit the page
                  const pageWidth = 210;
                  const pageHeight = 148;
                  const imgWidth = pageWidth;
                  const imgHeight = (canvas.height * pageWidth) / canvas.width;
                  
                  // Center the image if it's smaller than page
                  const xOffset = 0;
                  const yOffset = imgHeight < pageHeight ? (pageHeight - imgHeight) / 2 : 0;
                  
                  // Add canvas image to PDF
                  doc.addImage(canvasDataUrl, 'PNG', xOffset, yOffset, imgWidth, imgHeight);

                  // Save PDF
                  doc.save(`digital-card-${bookingId}.pdf`);
                  
                  // Show success toast
                  showToast('Digital card successfully download ho gaya!', 'success');
                  resolve();
                } catch (pdfError) {
                  console.error('PDF generation error:', pdfError);
                  reject(new Error('PDF generate karne mein error: ' + pdfError.message));
                }
              }).catch((importError) => {
                console.error('jsPDF import error:', importError);
                reject(new Error('PDF library load nahi ho saka'));
              });
            } catch (e) {
              console.error('Canvas processing error:', e);
              reject(e);
            }
          };
          
          img.onerror = (error) => {
            clearTimeout(timeout);
            console.error('Image load error:', error);
            reject(new Error('SVG image load nahi ho saka'));
          };
          
          // Load SVG data URL
          img.src = svgDataUrl;
        };
        
        reader.onerror = () => {
          clearTimeout(timeout);
          reject(new Error('SVG file read nahi ho saka'));
        };
        
        // Read SVG as data URL
        reader.readAsDataURL(svgBlob);
      });
    } catch (err) {
      console.error('Digital card download error:', err);
      showToast(err.message || 'Digital card download karne mein error aaya', 'error');
      setError(err.message || 'Digital card download karne mein error aaya');
    }
  };

  const cancelBooking = async (id) => {
    if (!window.confirm('Kya aap is booking ko cancel karna chahte hain?')) {
      return;
    }
    try {
      await apiFetch(`/api/reservations/${id}/cancel`, {
        method: 'PUT',
      });
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ marginBottom: '10px' }}>Welcome, {user?.name || 'User'}!</h2>
        <p style={{ color: '#6b7280' }}>Manage your bookings and chat with admin</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #e5e7eb' }}>
        <button
          onClick={() => setActiveTab('bookings')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'bookings' ? '#564ade' : 'transparent',
            color: activeTab === 'bookings' ? '#ffffff' : '#374151',
            border: 'none',
            borderBottom: activeTab === 'bookings' ? '3px solid #564ade' : '3px solid transparent',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
        >
          My Bookings
        </button>
        <button
          onClick={() => setActiveTab('new-booking')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'new-booking' ? '#564ade' : 'transparent',
            color: activeTab === 'new-booking' ? '#ffffff' : '#374151',
            border: 'none',
            borderBottom: activeTab === 'new-booking' ? '3px solid #564ade' : '3px solid transparent',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
        >
          New Booking
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'chat' ? '#564ade' : 'transparent',
            color: activeTab === 'chat' ? '#ffffff' : '#374151',
            border: 'none',
            borderBottom: activeTab === 'chat' ? '3px solid #564ade' : '3px solid transparent',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
        >
          Live Chat
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {/* Toast Notification */}
      {toast.show && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ef4444' : '#564ade',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            minWidth: '250px',
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          <span style={{ fontSize: '18px' }}>
            {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
          </span>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>{toast.message}</span>
        </div>
      )}

      {/* My Bookings Tab */}
      {activeTab === 'bookings' && (
        <section className="card table-card">
          <div className="card-header">
            <h3>My Bookings</h3>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Guests</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {myBookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                      Aapki koi booking nahi hai
                    </td>
                  </tr>
                ) : (
                  myBookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>
                        <strong>{booking.room?.roomNumber || '-'}</strong>
                        {booking.room?.type && (
                          <span style={{ fontSize: '11px', color: '#666', display: 'block' }}>
                            {booking.room.type}
                          </span>
                        )}
                      </td>
                      <td>{new Date(booking.checkInDate).toLocaleDateString()}</td>
                      <td>{new Date(booking.checkOutDate).toLocaleDateString()}</td>
                      <td>{booking.numGuests || 1}</td>
                      <td>
                        <span className={`status-badge status-${booking.status}`}>
                          {booking.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="table-btn"
                            onClick={() => downloadDigitalCard(booking._id)}
                            style={{ 
                              background: '#564ade', 
                              borderColor: '#564ade',
                              fontSize: '12px',
                              padding: '6px 12px'
                            }}
                          >
                            📥 Download Card
                          </button>
                          {booking.status === 'reserved' && (
                            <button
                              type="button"
                              className="table-btn"
                              onClick={() => cancelBooking(booking._id)}
                              style={{ 
                                background: '#ef4444', 
                                borderColor: '#ef4444',
                                fontSize: '12px',
                                padding: '6px 12px'
                              }}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* New Booking Tab */}
      {activeTab === 'new-booking' && (
        <section className="card table-card">
          <div className="card-header">
            <h3>New Booking</h3>
          </div>
          <form className="staff-form" onSubmit={handleNewBooking}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
                Select Room *
              </label>
              <select
                value={bookingForm.room}
                onChange={(e) => handleBookingFormChange('room', e.target.value)}
                onBlur={(e) => handleBookingFormChange('room', e.target.value)}
                required
                className={bookingFormErrors.room ? 'input-error' : ''}
              >
                <option value="">Select room</option>
                {rooms.map((room) => (
                  <option key={room._id} value={room._id}>
                    Room {room.roomNumber} - {room.type} (${room.pricePerNight}/night)
                  </option>
                ))}
              </select>
              {bookingFormErrors.room && <p className="field-error-text">{bookingFormErrors.room}</p>}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
                Check-in Date *
              </label>
              <input
                type="date"
                value={bookingForm.checkInDate}
                onChange={(e) => handleBookingFormChange('checkInDate', e.target.value)}
                onBlur={(e) => handleBookingFormChange('checkInDate', e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
                className={bookingFormErrors.checkInDate ? 'input-error' : ''}
              />
              {bookingFormErrors.checkInDate && <p className="field-error-text">{bookingFormErrors.checkInDate}</p>}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
                Check-out Date *
              </label>
              <input
                type="date"
                value={bookingForm.checkOutDate}
                onChange={(e) => handleBookingFormChange('checkOutDate', e.target.value)}
                onBlur={(e) => handleBookingFormChange('checkOutDate', e.target.value)}
                required
                min={bookingForm.checkInDate || new Date().toISOString().split('T')[0]}
                className={bookingFormErrors.checkOutDate ? 'input-error' : ''}
              />
              {bookingFormErrors.checkOutDate && <p className="field-error-text">{bookingFormErrors.checkOutDate}</p>}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
                Number of Guests *
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={bookingForm.numGuests}
                onChange={(e) => handleBookingFormChange('numGuests', Number(e.target.value))}
                onBlur={(e) => handleBookingFormChange('numGuests', Number(e.target.value))}
                required
                className={bookingFormErrors.numGuests ? 'input-error' : ''}
              />
              {bookingFormErrors.numGuests && <p className="field-error-text">{bookingFormErrors.numGuests}</p>}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
                Special Requests (Optional)
              </label>
              <textarea
                value={bookingForm.notes}
                onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                placeholder="Any special requests..."
                rows="3"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? 'Booking...' : 'Book Now'}
            </button>
          </form>
        </section>
      )}

      {/* Live Chat Tab */}
      {activeTab === 'chat' && (
        <LiveChat user={user} />
      )}
    </div>
  );
};

// Live Chat Component
const LiveChat = ({ user }) => {
  const { apiFetch } = useApiClient();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMessages();
    // Poll for new messages every 4 seconds (reduced frequency to prevent refresh issues)
    const interval = setInterval(() => {
      loadMessages();
    }, 4000);
    return () => clearInterval(interval);
  }, []); // Empty dependency array - only run once on mount

  const loadMessages = async () => {
    try {
      setError(''); // Clear errors
      const data = await apiFetch('/api/chat/messages');
      
      // Deduplicate messages by _id to prevent duplicates
      const uniqueMessages = (data || []).reduce((acc, msg) => {
        const msgId = msg._id?.toString() || msg._id;
        if (!acc.find(m => (m._id?.toString() || m._id) === msgId)) {
          acc.push(msg);
        }
        return acc;
      }, []);
      
      // Backend already filters to show only this user's conversation
      setMessages(uniqueMessages);
    } catch (err) {
      console.error('Failed to load messages:', err);
      // Don't show error to user, just log it
      setError('');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    setError('');
    try {
      await apiFetch('/api/chat/send', {
        method: 'POST',
        body: JSON.stringify({
          message: newMessage,
          // receiverId is null for user messages (goes to admin)
        }),
      });
      setNewMessage('');
      await loadMessages();
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card table-card">
      <div className="card-header">
        <h3>Live Chat with Admin</h3>
      </div>
      <div style={{ 
        height: '500px', 
        display: 'flex', 
        flexDirection: 'column',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          background: '#f9fafb'
        }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
              Koi messages nahi hain. Pehla message bhejein!
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id}
                style={{
                  marginBottom: '15px',
                  display: 'flex',
                  justifyContent: msg.senderRole === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: msg.senderRole === 'user' ? '#564ade' : '#ffffff',
                  color: msg.senderRole === 'user' ? '#ffffff' : '#111827',
                  border: msg.senderRole === 'admin' ? '1px solid #e5e7eb' : 'none',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>
                    {msg.senderRole === 'user' ? 'You' : 'Admin'} • {new Date(msg.createdAt).toLocaleString()}
                  </div>
                  <div>{msg.message}</div>
                </div>
              </div>
            ))
          )}
        </div>
        <form onSubmit={sendMessage} style={{
          padding: '15px',
          borderTop: '1px solid #e5e7eb',
          background: '#ffffff',
          display: 'flex',
          gap: '10px'
        }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            className="primary-btn"
            disabled={loading || !newMessage.trim()}
            style={{ padding: '10px 20px' }}
          >
            Send
          </button>
        </form>
        {error && <p className="error-text" style={{ margin: '10px 15px' }}>{error}</p>}
      </div>
    </section>
  );
};

export default UserDashboard;

