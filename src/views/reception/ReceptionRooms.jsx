import { useEffect, useState } from 'react';
import '../Dashboard.css';
import { useApiClient } from '../../utils/apiClient.js';
import { validateText, validateNumber } from '../../utils/validations.js';

const ReceptionRooms = () => {
  const { apiFetch } = useApiClient();
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({
    roomNumber: '',
    type: 'standard',
    pricePerNight: 0,
  });
  const [formErrors, setFormErrors] = useState({});
  const [editingRoom, setEditingRoom] = useState(null);
  const [editForm, setEditForm] = useState({
    roomNumber: '',
    type: 'standard',
    pricePerNight: 0,
    status: 'available',
  });
  const [editFormErrors, setEditFormErrors] = useState({});
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  const loadRooms = async () => {
    const data = await apiFetch('/api/rooms');
    setRooms(data);
  };

  useEffect(() => {
    loadRooms().catch((err) => setError(err.message));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await apiFetch(`/api/rooms/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      await loadRooms();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFormChange = (field, value) => {
    setForm({ ...form, [field]: value });
    
    // Real-time validation
    let fieldError = '';
    if (field === 'roomNumber') {
      fieldError = validateText(value, 'Room Number', 1, 20);
    } else if (field === 'pricePerNight') {
      fieldError = validateNumber(value, 'Price Per Night', 0, 100000, true);
    }
    
    setFormErrors({ ...formErrors, [field]: fieldError });
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate all fields
    const roomNumberError = validateText(form.roomNumber, 'Room Number', 1, 20);
    const priceError = validateNumber(form.pricePerNight, 'Price Per Night', 0, 100000, true);
    
    const newErrors = {
      roomNumber: roomNumberError,
      pricePerNight: priceError,
    };
    
    setFormErrors(newErrors);
    
    if (roomNumberError || priceError) {
      return;
    }
    
    try {
      await apiFetch('/api/rooms', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm({ roomNumber: '', type: 'standard', pricePerNight: 0 });
      setFormErrors({});
      await loadRooms();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setEditForm({
      roomNumber: room.roomNumber || '',
      type: room.type || 'standard',
      pricePerNight: room.pricePerNight || 0,
      status: room.status || 'available',
    });
    setShowEditModal(true);
    setError('');
  };

  const handleEditFormChange = (field, value) => {
    setEditForm({ ...editForm, [field]: value });
    
    // Real-time validation
    let fieldError = '';
    if (field === 'roomNumber') {
      fieldError = validateText(value, 'Room Number', 1, 20);
    } else if (field === 'pricePerNight') {
      fieldError = validateNumber(value, 'Price Per Night', 0, 100000, true);
    }
    
    setEditFormErrors({ ...editFormErrors, [field]: fieldError });
  };

  const handleUpdateRoom = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate all fields
    const roomNumberError = validateText(editForm.roomNumber, 'Room Number', 1, 20);
    const priceError = validateNumber(editForm.pricePerNight, 'Price Per Night', 0, 100000, true);
    
    const newErrors = {
      roomNumber: roomNumberError,
      pricePerNight: priceError,
    };
    
    setEditFormErrors(newErrors);
    
    if (roomNumberError || priceError) {
      return;
    }
    
    try {
      await apiFetch(`/api/rooms/${editingRoom._id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });
      setShowEditModal(false);
      setEditingRoom(null);
      setEditFormErrors({});
      await loadRooms();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm('Kya aap is room ko delete karna chahte hain?')) {
      return;
    }
    setError('');
    try {
      await apiFetch(`/api/rooms/${id}`, {
        method: 'DELETE',
      });
      await loadRooms();
    } catch (err) {
      setError(err.message);
    }
  };

  const roomsByStatus = {
    available: rooms.filter((r) => r.status === 'available'),
    occupied: rooms.filter((r) => r.status === 'occupied'),
    maintenance: rooms.filter((r) => r.status === 'maintenance'),
    reserved: rooms.filter((r) => r.status === 'reserved'),
  };

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <section className="card metric">
          <h3>Total Rooms</h3>
          <p className="metric-value">{rooms.length}</p>
          <span className="metric-label">All rooms</span>
        </section>
        <section className="card metric">
          <h3>Available</h3>
          <p className="metric-value">{roomsByStatus.available.length}</p>
          <span className="metric-label">Ready for booking</span>
        </section>
        <section className="card metric">
          <h3>Occupied</h3>
          <p className="metric-value">{roomsByStatus.occupied.length}</p>
          <span className="metric-label">Currently in use</span>
        </section>
        <section className="card metric">
          <h3>Maintenance</h3>
          <p className="metric-value">{roomsByStatus.maintenance.length}</p>
          <span className="metric-label">Under repair</span>
        </section>
      </div>

      <section className="card table-card">
        <div className="card-header">
          <h3>Room Inventory</h3>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Room Number</th>
                <th>Type</th>
                <th>Price/Night</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    No rooms found
                  </td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr key={room._id}>
                    <td><strong>{room.roomNumber}</strong></td>
                    <td>{room.type ? room.type.charAt(0).toUpperCase() + room.type.slice(1) : 'Standard'}</td>
                    <td>${room.pricePerNight || room.price || 0}</td>
                    <td>{room.capacity || 2} guests</td>
                    <td>
                      <span className={`status-badge status-${room.status}`}>
                        {room.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="table-btn"
                          onClick={() => handleEditRoom(room)}
                          style={{ background: '#10b981', borderColor: '#10b981' }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="table-btn"
                          onClick={() => handleDeleteRoom(room._id)}
                          style={{ background: '#ef4444', borderColor: '#ef4444' }}
                        >
                          Delete
                        </button>
                        {room.status !== 'available' && (
                          <button
                            type="button"
                            className="table-btn"
                            onClick={() => updateStatus(room._id, 'available')}
                          >
                            Available
                          </button>
                        )}
                        {room.status !== 'maintenance' && (
                          <button
                            type="button"
                            className="table-btn"
                            onClick={() => updateStatus(room._id, 'maintenance')}
                          >
                            Maintenance
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
          <h3>Add Room</h3>
        </div>
        <form className="staff-form" onSubmit={handleCreateRoom}>
          <div className="form-field">
            <label htmlFor="roomNumber">Room Number</label>
            <input
              id="roomNumber"
              type="text"
              placeholder="Room number likhain (e.g., 101, 202)"
              value={form.roomNumber}
              onChange={(e) => handleFormChange('roomNumber', e.target.value)}
              onBlur={(e) => handleFormChange('roomNumber', e.target.value)}
              required
              className={formErrors.roomNumber ? 'input-error' : ''}
            />
            {formErrors.roomNumber && <p className="field-error-text">{formErrors.roomNumber}</p>}
          </div>
          <div className="form-field">
            <label htmlFor="roomType">Room Type</label>
            <select
              id="roomType"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="standard">Standard</option>
              <option value="deluxe">Deluxe</option>
              <option value="suite">Suite</option>
              <option value="presidential">Presidential</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="pricePerNight">Price Per Night</label>
            <input
              id="pricePerNight"
              type="number"
              placeholder="Price likhain (e.g., 5000)"
              value={form.pricePerNight}
              onChange={(e) => handleFormChange('pricePerNight', Number(e.target.value))}
              onBlur={(e) => handleFormChange('pricePerNight', Number(e.target.value))}
              required
              min="0"
              step="0.01"
              className={formErrors.pricePerNight ? 'input-error' : ''}
            />
            {formErrors.pricePerNight && <p className="field-error-text">{formErrors.pricePerNight}</p>}
          </div>
          <div className="form-field">
            <button type="submit" className="primary-btn">
              Save Room
            </button>
          </div>
        </form>
        {error && <p className="error-text">{error}</p>}
      </section>

      {showEditModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#111827', fontSize: '20px', fontWeight: 600 }}>Edit Room</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingRoom(null);
                  setError('');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                  Room Number
                </label>
                <input
                  type="text"
                  value={editForm.roomNumber}
                  onChange={(e) => handleEditFormChange('roomNumber', e.target.value)}
                  onBlur={(e) => handleEditFormChange('roomNumber', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: editFormErrors.roomNumber ? '1px solid #dc2626' : '1px solid #d1d5db',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                {editFormErrors.roomNumber && (
                  <p style={{ color: '#dc2626', fontSize: '11px', marginTop: '4px' }}>
                    {editFormErrors.roomNumber}
                  </p>
                )}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                  Room Type
                </label>
                <select
                  value={editForm.type}
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px',
                    outline: 'none',
                    background: '#ffffff'
                  }}
                >
                  <option value="standard">Standard</option>
                  <option value="deluxe">Deluxe</option>
                  <option value="suite">Suite</option>
                  <option value="presidential">Presidential</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                  Price Per Night
                </label>
                <input
                  type="number"
                  value={editForm.pricePerNight}
                  onChange={(e) => handleEditFormChange('pricePerNight', Number(e.target.value))}
                  onBlur={(e) => handleEditFormChange('pricePerNight', Number(e.target.value))}
                  required
                  min="0"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: editFormErrors.pricePerNight ? '1px solid #dc2626' : '1px solid #d1d5db',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                {editFormErrors.pricePerNight && (
                  <p style={{ color: '#dc2626', fontSize: '11px', marginTop: '4px' }}>
                    {editFormErrors.pricePerNight}
                  </p>
                )}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px',
                    outline: 'none',
                    background: '#ffffff'
                  }}
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              {error && <p style={{ color: '#dc2626', fontSize: '12px', margin: 0 }}>{error}</p>}
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="submit"
                  className="primary-btn"
                  style={{ flex: 1 }}
                >
                  Update Room
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingRoom(null);
                    setError('');
                  }}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    background: '#ffffff',
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionRooms;


