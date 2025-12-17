import { useEffect, useState, useRef } from 'react';
import '../Dashboard.css';
import { useApiClient } from '../../utils/apiClient.js';
import { validateRequired, validateNumber, validateDate, validateDateRange } from '../../utils/validations.js';
import { Html5Qrcode } from 'html5-qrcode';

const ReceptionReservations = () => {
  const { apiFetch } = useApiClient();
  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [form, setForm] = useState({
    guest: '',
    room: '',
    checkInDate: '',
    checkOutDate: '',
    numGuests: 1,
  });
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState('');
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [qrInput, setQrInput] = useState('');
  const [scannedReservation, setScannedReservation] = useState(null);
  const [scanError, setScanError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraId, setCameraId] = useState(null);
  const qrCodeRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  const loadData = async () => {
    const [resList, roomList, guestList] = await Promise.all([
      apiFetch('/api/reservations'),
      apiFetch('/api/rooms'),
      apiFetch('/api/guests'),
    ]);
    setReservations(resList);
    setRooms(roomList);
    setGuests(guestList);
  };

  useEffect(() => {
    loadData().catch((err) => setError(err.message));
  }, []);

  const handleFormChange = (field, value) => {
    setForm({ ...form, [field]: value });
    
    // Real-time validation
    let fieldError = '';
    if (field === 'guest' || field === 'room') {
      fieldError = validateRequired(value, field === 'guest' ? 'Guest' : 'Room');
    } else if (field === 'checkInDate') {
      fieldError = validateDate(value, 'Check-in Date');
    } else if (field === 'checkOutDate') {
      fieldError = validateDate(value, 'Check-out Date');
      if (!fieldError && form.checkInDate) {
        fieldError = validateDateRange(form.checkInDate, value, 'Check-in Date', 'Check-out Date');
      }
    } else if (field === 'numGuests') {
      fieldError = validateNumber(value, 'Number of Guests', 1, 20);
    }
    
    setFormErrors({ ...formErrors, [field]: fieldError });
    
    // Re-validate check-out date if check-in date changes
    if (field === 'checkInDate' && form.checkOutDate) {
      const checkOutError = validateDateRange(value, form.checkOutDate, 'Check-in Date', 'Check-out Date');
      setFormErrors({ ...formErrors, [field]: fieldError, checkOutDate: checkOutError });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate all fields
    const guestError = validateRequired(form.guest, 'Guest');
    const roomError = validateRequired(form.room, 'Room');
    const checkInError = validateDate(form.checkInDate, 'Check-in Date');
    const checkOutError = validateDate(form.checkOutDate, 'Check-out Date');
    const dateRangeError = checkInError || checkOutError ? '' : validateDateRange(form.checkInDate, form.checkOutDate, 'Check-in Date', 'Check-out Date');
    const numGuestsError = validateNumber(form.numGuests, 'Number of Guests', 1, 20);
    
    const newErrors = {
      guest: guestError,
      room: roomError,
      checkInDate: checkInError,
      checkOutDate: checkOutError || dateRangeError,
      numGuests: numGuestsError,
    };
    
    setFormErrors(newErrors);
    
    if (guestError || roomError || checkInError || checkOutError || dateRangeError || numGuestsError) {
      return;
    }
    
    try {
      await apiFetch('/api/reservations', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm({
        guest: '',
        room: '',
        checkInDate: '',
        checkOutDate: '',
        numGuests: 1,
      });
      setFormErrors({});
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

  // Process scanned QR code data
  const processQRCode = async (qrDataString) => {
    setScanError('');
    setScannedReservation(null);
    
    if (!qrDataString || !qrDataString.trim()) {
      return;
    }

    try {
      // Try to parse as JSON first (if it's our QR code format)
      let qrData = qrDataString;
      try {
        const parsed = JSON.parse(qrDataString);
        qrData = JSON.stringify(parsed); // Re-stringify to ensure format
      } catch (e) {
        // If not JSON, use as is
      }

      const response = await fetch('https://luxury-stay-backend.vercel.app/api/reservations/scan-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid QR code');
      }

      setScannedReservation(data.reservation);
      // Stop scanning after successful scan
      if (html5QrCodeRef.current && isScanning) {
        await stopScanning();
      }
    } catch (err) {
      setScanError(err.message || 'Failed to scan QR code');
    }
  };

  // Start camera scanning
  const startScanning = async () => {
    try {
      setScanError('');
      setIsScanning(true);
      
      // Get available cameras
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        const selectedCameraId = cameraId || devices[0].id;
        setCameraId(selectedCameraId);
        
        const html5QrCode = new Html5Qrcode(qrCodeRef.current.id);
        html5QrCodeRef.current = html5QrCode;
        
        await html5QrCode.start(
          selectedCameraId,
          {
            fps: 10, // Frames per second
            qrbox: { width: 300, height: 300 }, // Scanning area
            aspectRatio: 1.0,
          },
          (decodedText, decodedResult) => {
            // Success callback - QR code detected
            processQRCode(decodedText);
          },
          (errorMessage) => {
            // Error callback - ignore, will keep trying
            // console.log('Scan error:', errorMessage);
          }
        );
      } else {
        throw new Error('No camera found. Please ensure camera is connected and permissions are granted.');
      }
    } catch (err) {
      setScanError(err.message || 'Failed to start camera');
      setIsScanning(false);
    }
  };

  // Stop camera scanning
  const stopScanning = async () => {
    try {
      if (html5QrCodeRef.current && isScanning) {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
      }
      setIsScanning(false);
    } catch (err) {
      console.error('Error stopping scanner:', err);
    }
  };

  // Manual QR input scan
  const handleScanQR = async () => {
    if (!qrInput.trim()) {
      setScanError('Please enter QR code data');
      return;
    }
    await processQRCode(qrInput);
  };

  // Handle scanner toggle
  const handleToggleScanner = async () => {
    if (qrScannerOpen) {
      // Closing scanner
      await stopScanning();
      setQrScannerOpen(false);
      setScannedReservation(null);
      setScanError('');
      setQrInput('');
    } else {
      // Opening scanner
      setQrScannerOpen(true);
      // Start scanning after a small delay to ensure DOM is ready
      setTimeout(() => {
        startScanning();
      }, 100);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
        html5QrCodeRef.current.clear().catch(() => {});
      }
    };
  }, []);

  const handleQRCheckIn = async () => {
    if (!scannedReservation) return;
    try {
      setError('');
      await apiFetch(`/api/reservations/${scannedReservation._id}/check-in`, { method: 'POST' });
      await loadData();
      setScannedReservation(null);
      await stopScanning();
      setQrScannerOpen(false);
      setQrInput('');
      setScanError('');
    } catch (err) {
      setError(err.message);
      setScanError(err.message);
    }
  };

  const handleQRCheckOut = async () => {
    if (!scannedReservation) return;
    try {
      setError('');
      await apiFetch(`/api/reservations/${scannedReservation._id}/check-out`, { method: 'POST' });
      await loadData();
      setScannedReservation(null);
      await stopScanning();
      setQrScannerOpen(false);
      setQrInput('');
      setScanError('');
    } catch (err) {
      setError(err.message);
      setScanError(err.message);
    }
  };

  const filtered =
    statusFilter === 'all'
      ? reservations
      : reservations.filter((r) => r.status === statusFilter);

  const reservationsByStatus = {
    all: reservations.length,
    reserved: reservations.filter((r) => r.status === 'reserved').length,
    checked_in: reservations.filter((r) => r.status === 'checked_in').length,
    checked_out: reservations.filter((r) => r.status === 'checked_out').length,
    cancelled: reservations.filter((r) => r.status === 'cancelled').length,
  };

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <section className="card metric">
          <h3>Total Reservations</h3>
          <p className="metric-value">{reservationsByStatus.all}</p>
          <span className="metric-label">All time</span>
        </section>
        <section className="card metric">
          <h3>Reserved</h3>
          <p className="metric-value">{reservationsByStatus.reserved}</p>
          <span className="metric-label">Awaiting check-in</span>
        </section>
        <section className="card metric">
          <h3>Checked In</h3>
          <p className="metric-value">{reservationsByStatus.checked_in}</p>
          <span className="metric-label">Currently staying</span>
        </section>
        <section className="card metric">
          <h3>Checked Out</h3>
          <p className="metric-value">{reservationsByStatus.checked_out}</p>
          <span className="metric-label">Completed stays</span>
        </section>
      </div>

      <section className="card table-card">
        <div className="card-header">
          <h3>Reservations</h3>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <button
              type="button"
              className="primary-btn"
              onClick={handleToggleScanner}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              {qrScannerOpen ? '❌ Close Scanner' : '📱 Open QR Scanner'}
            </button>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All statuses ({reservationsByStatus.all})</option>
              <option value="reserved">Reserved ({reservationsByStatus.reserved})</option>
              <option value="checked_in">Checked in ({reservationsByStatus.checked_in})</option>
              <option value="checked_out">Checked out ({reservationsByStatus.checked_out})</option>
              <option value="cancelled">Cancelled ({reservationsByStatus.cancelled})</option>
            </select>
          </div>
        </div>

        {qrScannerOpen && (
          <div style={{ padding: '20px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <h4 style={{ marginBottom: '15px' }}>Scan QR Code with Camera</h4>
            
            {/* Camera Scanner */}
            <div style={{ marginBottom: '20px' }}>
              <div 
                id="qr-reader"
                ref={qrCodeRef}
                style={{ 
                  width: '100%', 
                  maxWidth: '500px', 
                  margin: '0 auto',
                  background: '#ffffff',
                  borderRadius: '8px',
                  padding: '10px'
                }}
              ></div>
              {!isScanning && !scannedReservation && (
                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={startScanning}
                    style={{ padding: '10px 20px' }}
                  >
                    ▶️ Start Camera
                  </button>
                </div>
              )}
              {isScanning && (
                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                  <button
                    type="button"
                    className="table-btn"
                    onClick={stopScanning}
                    style={{ padding: '10px 20px', background: '#dc2626', borderColor: '#dc2626', color: '#ffffff' }}
                  >
                    ⏹️ Stop Camera
                  </button>
                </div>
              )}
            </div>

            {/* Manual Input (Fallback) */}
            <div style={{ marginBottom: '15px', padding: '15px', background: '#ffffff', borderRadius: '8px' }}>
              <p style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
                Or manually enter QR code data:
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  placeholder="Paste QR code data here"
                  style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
                <button
                  type="button"
                  className="primary-btn"
                  onClick={handleScanQR}
                  style={{ padding: '10px 20px' }}
                >
                  Scan
                </button>
              </div>
            </div>

            {scanError && (
              <div style={{ 
                padding: '12px', 
                background: '#fee2e2', 
                border: '1px solid #fca5a5', 
                borderRadius: '8px',
                marginBottom: '15px'
              }}>
                <p style={{ color: '#dc2626', fontSize: '14px', margin: 0 }}>⚠️ {scanError}</p>
              </div>
            )}
            {scannedReservation && (
              <div style={{ 
                background: '#ffffff', 
                padding: '20px', 
                borderRadius: '8px', 
                border: '2px solid #564ade',
                boxShadow: '0 4px 12px rgba(86, 74, 222, 0.15)'
              }}>
                <h4 style={{ marginBottom: '15px', color: '#564ade', fontSize: '18px' }}>
                  ✅ Reservation Found
                </h4>
                <div style={{ marginBottom: '20px', lineHeight: '1.8' }}>
                  <p><strong>Guest:</strong> {scannedReservation.guest?.firstName} {scannedReservation.guest?.lastName}</p>
                  <p><strong>Email:</strong> {scannedReservation.guest?.email || 'N/A'}</p>
                  <p><strong>Room:</strong> {scannedReservation.room?.roomNumber} - {scannedReservation.room?.type}</p>
                  <p><strong>Check-in Date:</strong> {new Date(scannedReservation.checkInDate).toLocaleDateString()}</p>
                  <p><strong>Check-out Date:</strong> {new Date(scannedReservation.checkOutDate).toLocaleDateString()}</p>
                  <p><strong>Guests:</strong> {scannedReservation.numGuests || 1}</p>
                  <p><strong>Status:</strong> <span className={`status-badge status-${scannedReservation.status}`}>
                    {scannedReservation.status.replace('_', ' ')}
                  </span></p>
                  {scannedReservation.status === 'reserved' && (
                    <p style={{ 
                      color: new Date() < new Date(scannedReservation.checkInDate) ? '#f59e0b' : '#10b981',
                      fontWeight: 600,
                      marginTop: '10px'
                    }}>
                      {new Date() < new Date(scannedReservation.checkInDate) 
                        ? `⚠️ Check-in date is ${new Date(scannedReservation.checkInDate).toLocaleDateString()}. Cannot check in before this date.`
                        : '✓ Ready for check-in'}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {scannedReservation.status === 'reserved' && (
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={handleQRCheckIn}
                      style={{ flex: 1, minWidth: '150px' }}
                      disabled={new Date() < new Date(scannedReservation.checkInDate)}
                    >
                      ✓ Check-in
                    </button>
                  )}
                  {scannedReservation.status === 'checked_in' && (
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={handleQRCheckOut}
                      style={{ flex: 1, minWidth: '150px', background: '#dc2626', borderColor: '#dc2626' }}
                    >
                      Check-out
                    </button>
                  )}
                  <button
                    type="button"
                    className="table-btn"
                    onClick={async () => {
                      setScannedReservation(null);
                      setQrInput('');
                      setScanError('');
                      if (isScanning) {
                        await startScanning(); // Restart scanning
                      }
                    }}
                    style={{ minWidth: '100px' }}
                  >
                    Scan Again
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    No reservations found
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <strong>
                        {r.guest
                          ? `${r.guest.firstName} ${r.guest.lastName || ''}`
                          : 'Guest'}
                      </strong>
                      {r.guest?.email && (
                        <span style={{ fontSize: '11px', color: '#666', display: 'block' }}>
                          {r.guest.email}
                        </span>
                      )}
                    </td>
                    <td>
                      <strong>{r.room?.roomNumber || '-'}</strong>
                      {r.room?.type && (
                        <span style={{ fontSize: '11px', color: '#666', display: 'block' }}>
                          {r.room.type}
                        </span>
                      )}
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
          <h3>Create Reservation</h3>
        </div>
        <form className="staff-form" onSubmit={handleSubmit}>
          <div>
            <select
              value={form.guest}
              onChange={(e) => handleFormChange('guest', e.target.value)}
              onBlur={(e) => handleFormChange('guest', e.target.value)}
              required
              className={formErrors.guest ? 'input-error' : ''}
            >
              <option value="">Select guest</option>
              {guests.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.firstName} {g.lastName || ''}
                </option>
              ))}
            </select>
            {formErrors.guest && <p className="field-error-text">{formErrors.guest}</p>}
          </div>
          <div>
            <select
              value={form.room}
              onChange={(e) => handleFormChange('room', e.target.value)}
              onBlur={(e) => handleFormChange('room', e.target.value)}
              required
              className={formErrors.room ? 'input-error' : ''}
            >
              <option value="">Select room</option>
              {rooms.map((room) => (
                <option key={room._id} value={room._id}>
                  {room.roomNumber} · {room.type}
                </option>
              ))}
            </select>
            {formErrors.room && <p className="field-error-text">{formErrors.room}</p>}
          </div>
          <div>
            <input
              type="date"
              value={form.checkInDate}
              onChange={(e) => handleFormChange('checkInDate', e.target.value)}
              onBlur={(e) => handleFormChange('checkInDate', e.target.value)}
              required
              className={formErrors.checkInDate ? 'input-error' : ''}
            />
            {formErrors.checkInDate && <p className="field-error-text">{formErrors.checkInDate}</p>}
          </div>
          <div>
            <input
              type="date"
              value={form.checkOutDate}
              onChange={(e) => handleFormChange('checkOutDate', e.target.value)}
              onBlur={(e) => handleFormChange('checkOutDate', e.target.value)}
              required
              className={formErrors.checkOutDate ? 'input-error' : ''}
            />
            {formErrors.checkOutDate && <p className="field-error-text">{formErrors.checkOutDate}</p>}
          </div>
          <div>
            <input
              type="number"
              min="1"
              max="20"
              value={form.numGuests}
              onChange={(e) => handleFormChange('numGuests', Number(e.target.value))}
              onBlur={(e) => handleFormChange('numGuests', Number(e.target.value))}
              required
              className={formErrors.numGuests ? 'input-error' : ''}
            />
            {formErrors.numGuests && <p className="field-error-text">{formErrors.numGuests}</p>}
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

export default ReceptionReservations;


