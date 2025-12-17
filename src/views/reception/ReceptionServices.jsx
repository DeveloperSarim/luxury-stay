import { useEffect, useState } from 'react';
import '../Dashboard.css';
import { useApiClient } from '../../utils/apiClient.js';

const ReceptionServices = () => {
  const { apiFetch } = useApiClient();
  const [services, setServices] = useState([]);
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({
    guest: '',
    room: '',
    type: 'room_service',
    details: '',
  });
  const [error, setError] = useState('');

  const loadServices = async () => {
    const data = await apiFetch('/api/services');
    setServices(data);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await loadServices();
        const [guestList, roomList] = await Promise.all([
          apiFetch('/api/guests'),
          apiFetch('/api/rooms'),
        ]);
        setGuests(guestList);
        setRooms(roomList);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await apiFetch(`/api/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      await loadServices();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await apiFetch('/api/services', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm({
        guest: '',
        room: '',
        type: 'room_service',
        details: '',
      });
      await loadServices();
    } catch (err) {
      setError(err.message);
    }
  };

  const servicesByStatus = {
    pending: services.filter((s) => s.status === 'pending'),
    in_progress: services.filter((s) => s.status === 'in_progress'),
    completed: services.filter((s) => s.status === 'completed'),
  };

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <section className="card metric">
          <h3>Total Requests</h3>
          <p className="metric-value">{services.length}</p>
          <span className="metric-label">All service requests</span>
        </section>
        <section className="card metric">
          <h3>Pending</h3>
          <p className="metric-value">{servicesByStatus.pending.length}</p>
          <span className="metric-label">Awaiting action</span>
        </section>
        <section className="card metric">
          <h3>In Progress</h3>
          <p className="metric-value">{servicesByStatus.in_progress.length}</p>
          <span className="metric-label">Being handled</span>
        </section>
        <section className="card metric">
          <h3>Completed</h3>
          <p className="metric-value">{servicesByStatus.completed.length}</p>
          <span className="metric-label">Finished</span>
        </section>
      </div>

      <section className="card table-card">
        <div className="card-header">
          <h3>Service Requests</h3>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Guest</th>
                <th>Room</th>
                <th>Service Type</th>
                <th>Details</th>
                <th>Requested</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    No service requests found
                  </td>
                </tr>
              ) : (
                services.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <strong>
                        {s.guest
                          ? `${s.guest.firstName} ${s.guest.lastName || ''}`
                          : 'Guest'}
                      </strong>
                    </td>
                    <td>{s.room?.roomNumber || '-'}</td>
                    <td>
                      {s.type ? s.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : '-'}
                    </td>
                    <td>{s.details || '-'}</td>
                    <td>
                      {s.createdAt 
                        ? new Date(s.createdAt).toLocaleDateString() 
                        : '-'}
                    </td>
                    <td>
                      <span className={`status-badge status-${s.status}`}>
                        {s.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      {s.status !== 'completed' && (
                        <button
                          type="button"
                          className="table-btn"
                          onClick={() => updateStatus(s._id, 'completed')}
                        >
                          Complete
                        </button>
                      )}
                      {s.status === 'pending' && (
                        <button
                          type="button"
                          className="table-btn"
                          onClick={() => updateStatus(s._id, 'in_progress')}
                          style={{ marginLeft: '8px' }}
                        >
                          Start
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
          <h3>Create Service Request</h3>
        </div>
        <form className="staff-form" onSubmit={handleCreateService}>
          <select
            value={form.guest}
            onChange={(e) => setForm({ ...form, guest: e.target.value })}
            required
          >
            <option value="">Select guest</option>
            {guests.map((g) => (
              <option key={g._id} value={g._id}>
                {g.firstName} {g.lastName || ''}
              </option>
            ))}
          </select>
          <select
            value={form.room}
            onChange={(e) => setForm({ ...form, room: e.target.value })}
          >
            <option value="">Select room (optional)</option>
            {rooms.map((r) => (
              <option key={r._id} value={r._id}>
                {r.roomNumber} · {r.type}
              </option>
            ))}
          </select>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="room_service">Room Service</option>
            <option value="wake_up_call">Wake-up Call</option>
            <option value="transport">Transport</option>
            <option value="other">Other</option>
          </select>
          <input
            type="text"
            placeholder="Details"
            value={form.details}
            onChange={(e) => setForm({ ...form, details: e.target.value })}
          />
          <button type="submit" className="primary-btn">
            Save Request
          </button>
        </form>
        {error && <p className="error-text">{error}</p>}
      </section>
    </div>
  );
};

export default ReceptionServices;


