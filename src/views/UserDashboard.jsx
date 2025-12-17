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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bookings, roomsList] = await Promise.all([
        apiFetch('/api/reservations/my-bookings'),
        apiFetch('/api/rooms?status=available'),
      ]);
      setMyBookings(bookings || []);
      setRooms(roomsList || []);
    } catch (err) {
      setError(err.message);
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

  const downloadQRCode = async (id) => {
    try {
      setError('');
      const data = await apiFetch(`/api/reservations/${id}/qr-code`);
      
      if (data.qrCode) {
        // Create a link element to download the QR code
        const link = document.createElement('a');
        link.href = data.qrCode;
        link.download = `qr-code-${data.reservationId}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setError('QR code generate nahi ho saka');
      }
    } catch (err) {
      setError(err.message || 'QR code download karne mein error aaya');
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
                            onClick={() => downloadQRCode(booking._id)}
                            style={{ 
                              background: '#564ade', 
                              borderColor: '#564ade',
                              fontSize: '12px',
                              padding: '6px 12px'
                            }}
                          >
                            📥 QR Code
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

