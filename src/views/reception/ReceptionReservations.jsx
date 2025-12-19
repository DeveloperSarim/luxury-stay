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
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [qrInput, setQrInput] = useState('');
  const [scannedReservation, setScannedReservation] = useState(null);
  const [scanError, setScanError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraId, setCameraId] = useState(null);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
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
      const booking = reservations.find(b => b._id === bookingId);
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
        : 'Guest';
      const guestEmail = booking.guest?.email || '';
      const guestPhone = booking.guest?.phone || '';
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

  // Process scanned QR code data
  const processQRCode = async (qrDataString) => {
    setScanError('');
    setScannedReservation(null);
    
    if (!qrDataString || !qrDataString.trim()) {
      setScanError('QR code data is empty');
      return;
    }

    try {
      // Try to parse as JSON first (if it's our QR code format)
      let qrData = qrDataString.trim();
      
      // If it's already a JSON string, validate it
      try {
        const parsed = JSON.parse(qrData);
        // Ensure it has required fields
        if (!parsed.reservationId) {
          throw new Error('Invalid QR code format: missing reservationId');
        }
        qrData = JSON.stringify(parsed); // Re-stringify to ensure format
      } catch (parseError) {
        // If not valid JSON, throw error
        throw new Error('Invalid QR code format. Please scan a valid reservation QR code.');
      }

      // Use apiClient instead of direct fetch
      const data = await apiFetch('/api/reservations/scan-qr', {
        method: 'POST',
        body: JSON.stringify({ qrData }),
      });

      // Check if data is null (network error case)
      if (!data) {
        throw new Error('Network error. Please check your connection and try again.');
      }

      // Backend returns { reservation, isValid, message }
      if (data.reservation) {
        setScannedReservation(data.reservation);
        // Stop scanning after successful scan
        if (html5QrCodeRef.current && isScanning) {
          await stopScanning();
        }
      } else if (data.message) {
        throw new Error(data.message);
      } else {
        throw new Error('Invalid QR code response from server');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to scan QR code. Please try again.';
      setScanError(errorMessage);
      console.error('QR scan error:', err);
    }
  };

  // Find back camera from available devices
  const findBackCamera = (devices) => {
    // Try to find back camera by label (common patterns)
    const backCamera = devices.find(device => {
      const label = device.label.toLowerCase();
      return label.includes('back') || 
             label.includes('rear') || 
             label.includes('environment') ||
             (label.includes('facing') && label.includes('back')) ||
             label.includes('2') && devices.length > 1; // Usually back camera is second
    });
    
    if (backCamera) {
      return devices.indexOf(backCamera);
    }
    
    // If no back camera found by label, use the last camera (usually back on mobile)
    return devices.length > 1 ? devices.length - 1 : 0;
  };

  // Start camera scanning
  const startScanning = async (cameraIndex = null) => {
    try {
      setScanError('');
      setIsScanning(true);
      
      // Get available cameras
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        // Store available cameras
        setAvailableCameras(devices);
        
        // Determine which camera to use
        let selectedIndex;
        if (cameraIndex !== null) {
          selectedIndex = cameraIndex;
        } else if (cameraId) {
          // If cameraId is already set, find its index
          selectedIndex = devices.findIndex(d => d.id === cameraId);
          if (selectedIndex === -1) {
            // Camera ID not found, use back camera
            selectedIndex = findBackCamera(devices);
          }
        } else {
          // Default: use back camera
          selectedIndex = findBackCamera(devices);
        }
        
        // Ensure index is valid
        selectedIndex = Math.max(0, Math.min(selectedIndex, devices.length - 1));
        setCurrentCameraIndex(selectedIndex);
        
        const selectedCameraId = devices[selectedIndex].id;
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

  // Switch between front and back camera
  const switchCamera = async () => {
    if (availableCameras.length <= 1) {
      setScanError('Only one camera available');
      return;
    }
    
    try {
      // Stop current camera
      await stopScanning();
      
      // Switch to next camera
      const nextIndex = (currentCameraIndex + 1) % availableCameras.length;
      
      // Small delay to ensure camera is stopped
      setTimeout(() => {
        startScanning(nextIndex);
      }, 300);
    } catch (err) {
      setScanError(err.message || 'Failed to switch camera');
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
          <div className="card-header-actions">
            <button
              type="button"
              className="primary-btn"
              onClick={handleToggleScanner}
              style={{ padding: '8px 16px', fontSize: '14px', whiteSpace: 'nowrap' }}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h4 style={{ margin: 0 }}>Scan QR Code with Camera</h4>
              {isScanning && availableCameras[currentCameraIndex] && (
                <span style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>
                  📷 {availableCameras[currentCameraIndex].label}
                </span>
              )}
            </div>
            
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
                <div style={{ textAlign: 'center', marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {availableCameras.length > 1 && (
                    <button
                      type="button"
                      className="table-btn"
                      onClick={switchCamera}
                      style={{ 
                        padding: '10px 20px', 
                        background: '#564ade', 
                        borderColor: '#564ade', 
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px'
                      }}
                      title={`Switch camera (Currently: ${availableCameras[currentCameraIndex]?.label || 'Camera ' + (currentCameraIndex + 1)})`}
                    >
                      🔄 Switch Camera
                    </button>
                  )}
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
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="table-btn"
                          onClick={() => downloadDigitalCard(r._id)}
                          style={{ 
                            background: '#564ade', 
                            borderColor: '#564ade',
                            fontSize: '12px',
                            padding: '6px 12px'
                          }}
                        >
                          📥 Download Card
                        </button>
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
                      </div>
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
              min={new Date().toISOString().split('T')[0]}
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
              min={form.checkInDate || new Date().toISOString().split('T')[0]}
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
    </div>
  );
};

export default ReceptionReservations;


