import { useEffect, useState } from 'react';
import './Dashboard.css';
import { useApiClient } from '../utils/apiClient.js';

const MaintenanceDashboard = () => {
  const { apiFetch } = useApiClient();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const list = await apiFetch('/api/maintenance');
        setItems(list);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, [apiFetch]);

  const openCount = items.filter((i) => i.status === 'open').length;
  const highPriority = items.filter((i) => i.priority === 'high').length;

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <section className="card metric">
          <h3>Open Issues</h3>
          <p className="metric-value">{openCount}</p>
          <span className="metric-label">Total requests</span>
        </section>
        <section className="card metric">
          <h3>High Priority</h3>
          <p className="metric-value">{highPriority}</p>
          <span className="metric-label">Need immediate attention</span>
        </section>
      </div>

      <section className="card table-card">
        <div className="card-header">
          <h3>Maintenance Requests</h3>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Room</th>
                <th>Issue</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i._id}>
                  <td>{i.room?.roomNumber || '-'}</td>
                  <td>{i.issue}</td>
                  <td>{i.priority}</td>
                  <td>{i.status}</td>
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

export default MaintenanceDashboard;


