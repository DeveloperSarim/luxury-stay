import { useEffect, useState } from 'react';
import './Dashboard.css';
import { useApiClient } from '../utils/apiClient.js';

const HousekeepingDashboard = () => {
  const { apiFetch } = useApiClient();
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const list = await apiFetch('/api/housekeeping');
        setTasks(list);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, [apiFetch]);

  const roomsToClean = tasks.filter((t) => t.status === 'pending').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <section className="card metric">
          <h3>Rooms to Clean</h3>
          <p className="metric-value">{roomsToClean}</p>
          <span className="metric-label">After check-out</span>
        </section>
        <section className="card metric">
          <h3>In Progress</h3>
          <p className="metric-value">{inProgress}</p>
          <span className="metric-label">Currently cleaning</span>
        </section>
      </div>

      <section className="card table-card">
        <div className="card-header">
          <h3>Housekeeping Tasks</h3>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Room</th>
                <th>Assigned To</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t._id}>
                  <td>{t.room?.roomNumber}</td>
                  <td>{t.assignedTo?.name || '-'}</td>
                  <td>{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {error && <p className="error-text">{error}</p>}
      </section>
    </div>
  );
};

export default HousekeepingDashboard;


