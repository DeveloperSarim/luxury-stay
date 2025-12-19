import { useEffect, useState } from 'react';
import './Dashboard.css';
import { useApiClient } from '../utils/apiClient.js';
import { validateName, validateEmail, validatePhone, validatePassword, validateRequired, validateNumber, validateDate, validateDateRange } from '../utils/validations.js';

const ReceptionDashboard = () => {
  const { apiFetch } = useApiClient();
  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);
  const [guestForm, setGuestForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [guestFormErrors, setGuestFormErrors] = useState({});
  const [resForm, setResForm] = useState({
    guest: '',
    room: '',
    checkInDate: '',
    checkOutDate: '',
    numGuests: 1,
  });
  const [resFormErrors, setResFormErrors] = useState({});
  const [error, setError] = useState('');

  const loadData = async () => {
    const [resList, roomList, guestList] = await Promise.all([
      apiFetch('/api/reservations'),
      apiFetch('/api/rooms?status=available'),
      apiFetch('/api/guests'),
    ]);
    setReservations(resList);
    setRooms(roomList);
    setGuests(guestList);
  };

  useEffect(() => {
    loadData().catch((err) => setError(err.message));
  }, []);

  const handleGuestFormChange = (field, value) => {
    setGuestForm({ ...guestForm, [field]: value });
    
    // Real-time validation
    let fieldError = '';
    if (field === 'firstName') {
      fieldError = validateName(value);
    } else if (field === 'lastName' && value) {
      fieldError = validateName(value);
    } else if (field === 'email' && value) {
      fieldError = validateEmail(value);
    } else if (field === 'phone' && value) {
      fieldError = validatePhone(value);
    } else if (field === 'password') {
      fieldError = validatePassword(value);
    }
    
    setGuestFormErrors({ ...guestFormErrors, [field]: fieldError });
  };

  const handleCreateGuest = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate all fields
    const firstNameError = validateName(guestForm.firstName);
    const lastNameError = guestForm.lastName ? validateName(guestForm.lastName) : '';
    const emailError = guestForm.email ? validateEmail(guestForm.email) : '';
    const phoneError = guestForm.phone ? validatePhone(guestForm.phone) : '';
    const passwordError = validatePassword(guestForm.password);
    
    const newErrors = {
      firstName: firstNameError,
      lastName: lastNameError,
      email: emailError,
      phone: phoneError,
      password: passwordError,
    };
    
    setGuestFormErrors(newErrors);
    
    if (firstNameError || lastNameError || emailError || phoneError || passwordError) {
      return;
    }
    
    try {
      await apiFetch('/api/guests', {
        method: 'POST',
        body: JSON.stringify(guestForm),
      });
      setGuestForm({ firstName: '', lastName: '', email: '', phone: '', password: '' });
      setGuestFormErrors({});
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResFormChange = (field, value) => {
    setResForm({ ...resForm, [field]: value });
    
    // Real-time validation
    let fieldError = '';
    if (field === 'guest' || field === 'room') {
      fieldError = validateRequired(value, field === 'guest' ? 'Guest' : 'Room');
    } else if (field === 'checkInDate') {
      fieldError = validateDate(value, 'Check-in Date');
    } else if (field === 'checkOutDate') {
      fieldError = validateDate(value, 'Check-out Date');
      if (!fieldError && resForm.checkInDate) {
        fieldError = validateDateRange(resForm.checkInDate, value, 'Check-in Date', 'Check-out Date');
      }
    } else if (field === 'numGuests') {
      fieldError = validateNumber(value, 'Number of Guests', 1, 20);
    }
    
    setResFormErrors({ ...resFormErrors, [field]: fieldError });
    
    // Re-validate check-out date if check-in date changes
    if (field === 'checkInDate' && resForm.checkOutDate) {
      const checkOutError = validateDateRange(value, resForm.checkOutDate, 'Check-in Date', 'Check-out Date');
      setResFormErrors({ ...resFormErrors, [field]: fieldError, checkOutDate: checkOutError });
    }
  };

  const handleCreateReservation = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate all fields
    const guestError = validateRequired(resForm.guest, 'Guest');
    const roomError = validateRequired(resForm.room, 'Room');
    const checkInError = validateDate(resForm.checkInDate, 'Check-in Date');
    const checkOutError = validateDate(resForm.checkOutDate, 'Check-out Date');
    const dateRangeError = checkInError || checkOutError ? '' : validateDateRange(resForm.checkInDate, resForm.checkOutDate, 'Check-in Date', 'Check-out Date');
    const numGuestsError = validateNumber(resForm.numGuests, 'Number of Guests', 1, 20);
    
    const newErrors = {
      guest: guestError,
      room: roomError,
      checkInDate: checkInError,
      checkOutDate: checkOutError || dateRangeError,
      numGuests: numGuestsError,
    };
    
    setResFormErrors(newErrors);
    
    if (guestError || roomError || checkInError || checkOutError || dateRangeError || numGuestsError) {
      return;
    }
    
    try {
      await apiFetch('/api/reservations', {
        method: 'POST',
        body: JSON.stringify(resForm),
      });
      setResForm({
        guest: '',
        room: '',
        checkInDate: '',
        checkOutDate: '',
        numGuests: 1,
      });
      setResFormErrors({});
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCheckIn = async (id) => {
    try {
      await apiFetch(`/api/reservations/${id}/check-in`, { method: 'POST' });
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCheckOut = async (id) => {
    try {
      await apiFetch(`/api/reservations/${id}/check-out`, { method: 'POST' });
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const arrivalsToday = reservations.filter((r) => {
    const checkIn = new Date(r.checkInDate).toISOString().split('T')[0];
    return (r.status === 'reserved' || r.status === 'checked_in') && checkIn === today;
  }).length;

  const departuresToday = reservations.filter((r) => {
    const checkOut = new Date(r.checkOutDate).toISOString().split('T')[0];
    return r.status === 'checked_in' && checkOut === today;
  }).length;

  const totalGuests = guests.length;
  const occupiedRooms = reservations.filter((r) => r.status === 'checked_in').length;
  const pendingReservations = reservations.filter((r) => r.status === 'reserved').length;

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <section className="card metric">
          <h3>Today&apos;s Arrivals</h3>
          <p className="metric-value">{arrivalsToday}</p>
          <span className="metric-label">Guests to check-in</span>
        </section>
        <section className="card metric">
          <h3>Today&apos;s Departures</h3>
          <p className="metric-value">{departuresToday}</p>
          <span className="metric-label">Guests checking out</span>
        </section>
        <section className="card metric">
          <h3>Available Rooms</h3>
          <p className="metric-value">{rooms.length}</p>
          <span className="metric-label">Ready for booking</span>
        </section>
        <section className="card metric">
          <h3>Occupied Rooms</h3>
          <p className="metric-value">{occupiedRooms}</p>
          <span className="metric-label">Currently checked in</span>
        </section>
        <section className="card metric">
          <h3>Total Guests</h3>
          <p className="metric-value">{totalGuests}</p>
          <span className="metric-label">Registered guests</span>
        </section>
        <section className="card metric">
          <h3>Pending Reservations</h3>
          <p className="metric-value">{pendingReservations}</p>
          <span className="metric-label">Awaiting check-in</span>
        </section>
      </div>

      <section className="card table-card">
        <div className="card-header">
          <h3>Recent Reservations</h3>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Guest</th>
                <th>Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Guests</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    No reservations found
                  </td>
                </tr>
              ) : (
                reservations.slice(0, 10).map((r) => (
                  <tr key={r._id}>
                    <td>
                      {r.guest
                        ? `${r.guest.firstName} ${r.guest.lastName || ''}`
                        : 'Guest'}
                    </td>
                    <td>
                      <strong>{r.room?.roomNumber || '-'}</strong>
                      {r.room?.type && <span style={{ fontSize: '11px', color: '#666', display: 'block' }}>{r.room.type}</span>}
                    </td>
                    <td>{new Date(r.checkInDate).toLocaleDateString()}</td>
                    <td>{new Date(r.checkOutDate).toLocaleDateString()}</td>
                    <td>{r.numGuests || 1}</td>
                    <td>
                      <span className={`status-badge status-${r.status}`}>
                        {r.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      {r.status === 'reserved' && (
                        <button
                          type="button"
                          className="table-btn"
                          onClick={() => handleCheckIn(r._id)}
                        >
                          Check-in
                        </button>
                      )}
                      {r.status === 'checked_in' && (
                        <button
                          type="button"
                          className="table-btn"
                          onClick={() => handleCheckOut(r._id)}
                        >
                          Check-out
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card table-card">
        <div className="card-header">
          <h3>Create Guest</h3>
        </div>
        <form className="staff-form" onSubmit={handleCreateGuest}>
          <div>
            <input
              type="text"
              placeholder="First name"
              value={guestForm.firstName}
              onChange={(e) => handleGuestFormChange('firstName', e.target.value)}
              onBlur={(e) => handleGuestFormChange('firstName', e.target.value)}
              required
              className={guestFormErrors.firstName ? 'input-error' : ''}
            />
            {guestFormErrors.firstName && <p className="field-error-text">{guestFormErrors.firstName}</p>}
          </div>
          <div>
            <input
              type="text"
              placeholder="Last name"
              value={guestForm.lastName}
              onChange={(e) => handleGuestFormChange('lastName', e.target.value)}
              onBlur={(e) => handleGuestFormChange('lastName', e.target.value)}
              className={guestFormErrors.lastName ? 'input-error' : ''}
            />
            {guestFormErrors.lastName && <p className="field-error-text">{guestFormErrors.lastName}</p>}
          </div>
          <div>
            <input
              type="email"
              placeholder="Email"
              value={guestForm.email}
              onChange={(e) => handleGuestFormChange('email', e.target.value)}
              onBlur={(e) => handleGuestFormChange('email', e.target.value)}
              className={guestFormErrors.email ? 'input-error' : ''}
            />
            {guestFormErrors.email && <p className="field-error-text">{guestFormErrors.email}</p>}
          </div>
          <div>
            <input
              type="text"
              placeholder="Phone"
              value={guestForm.phone}
              onChange={(e) => handleGuestFormChange('phone', e.target.value)}
              onBlur={(e) => handleGuestFormChange('phone', e.target.value)}
              className={guestFormErrors.phone ? 'input-error' : ''}
            />
            {guestFormErrors.phone && <p className="field-error-text">{guestFormErrors.phone}</p>}
          </div>
          <div>
            <input
              type="password"
              placeholder="Password *"
              value={guestForm.password}
              onChange={(e) => handleGuestFormChange('password', e.target.value)}
              onBlur={(e) => handleGuestFormChange('password', e.target.value)}
              required
              className={guestFormErrors.password ? 'input-error' : ''}
            />
            {guestFormErrors.password && <p className="field-error-text">{guestFormErrors.password}</p>}
          </div>
          <button type="submit" className="primary-btn">
            Save Guest
          </button>
        </form>
      </section>

      <section className="card table-card">
        <div className="card-header">
          <h3>Create Reservation</h3>
        </div>
        <form className="staff-form" onSubmit={handleCreateReservation}>
          <div>
            <select
              value={resForm.guest}
              onChange={(e) => handleResFormChange('guest', e.target.value)}
              onBlur={(e) => handleResFormChange('guest', e.target.value)}
              required
              className={resFormErrors.guest ? 'input-error' : ''}
            >
              <option value="">Select guest</option>
              {guests.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.firstName} {g.lastName || ''}
                </option>
              ))}
            </select>
            {resFormErrors.guest && <p className="field-error-text">{resFormErrors.guest}</p>}
          </div>
          <div>
            <select
              value={resForm.room}
              onChange={(e) => handleResFormChange('room', e.target.value)}
              onBlur={(e) => handleResFormChange('room', e.target.value)}
              required
              className={resFormErrors.room ? 'input-error' : ''}
            >
              <option value="">Select room</option>
              {rooms.map((room) => (
                <option key={room._id} value={room._id}>
                  {room.roomNumber} · {room.type}
                </option>
              ))}
            </select>
            {resFormErrors.room && <p className="field-error-text">{resFormErrors.room}</p>}
          </div>
          <div>
            <input
              type="date"
              value={resForm.checkInDate}
              onChange={(e) => handleResFormChange('checkInDate', e.target.value)}
              onBlur={(e) => handleResFormChange('checkInDate', e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
              className={resFormErrors.checkInDate ? 'input-error' : ''}
            />
            {resFormErrors.checkInDate && <p className="field-error-text">{resFormErrors.checkInDate}</p>}
          </div>
          <div>
            <input
              type="date"
              value={resForm.checkOutDate}
              onChange={(e) => handleResFormChange('checkOutDate', e.target.value)}
              onBlur={(e) => handleResFormChange('checkOutDate', e.target.value)}
              required
              min={resForm.checkInDate || new Date().toISOString().split('T')[0]}
              className={resFormErrors.checkOutDate ? 'input-error' : ''}
            />
            {resFormErrors.checkOutDate && <p className="field-error-text">{resFormErrors.checkOutDate}</p>}
          </div>
          <div>
            <input
              type="number"
              min="1"
              max="20"
              value={resForm.numGuests}
              onChange={(e) => handleResFormChange('numGuests', Number(e.target.value))}
              onBlur={(e) => handleResFormChange('numGuests', Number(e.target.value))}
              required
              className={resFormErrors.numGuests ? 'input-error' : ''}
            />
            {resFormErrors.numGuests && <p className="field-error-text">{resFormErrors.numGuests}</p>}
          </div>
          <button type="submit" className="primary-btn">
            Book
          </button>
        </form>
        {error && <p className="error-text">{error}</p>}
      </section>
    </div>
  );
};

export default ReceptionDashboard;


