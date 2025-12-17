import { useEffect, useState } from 'react';
import './Dashboard.css';
import { useApiClient } from '../utils/apiClient.js';

const ReportsDashboard = () => {
  const { apiFetch } = useApiClient();
  const [summary, setSummary] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [s, f] = await Promise.all([
          apiFetch('/api/reports/summary'),
          apiFetch('/api/feedback'),
        ]);
        setSummary(s);
        setFeedback(f);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, [apiFetch]);

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <section className="card metric">
          <h3>Revenue (Paid)</h3>
          <p className="metric-value">
            {summary ? `$${summary.revenue.toLocaleString()}` : '...'}
          </p>
          <span className="metric-label">All time</span>
        </section>
        <section className="card metric">
          <h3>Reservations</h3>
          <p className="metric-value">
            {summary ? summary.totalReservations : '...'}
          </p>
          <span className="metric-label">All bookings</span>
        </section>
        <section className="card metric">
          <h3>Guest Rating (Today)</h3>
          <p className="metric-value">
            {summary ? summary.avgRating.toFixed(1) : '...'}
          </p>
          <span className="metric-label">Out of 5</span>
        </section>
      </div>

      <section className="card table-card">
        <div className="card-header">
          <h3>Recent Feedback</h3>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Guest</th>
                <th>Rating</th>
                <th>Comment</th>
              </tr>
            </thead>
            <tbody>
              {feedback.map((f) => (
                <tr key={f._id}>
                  <td>{f.guest?.firstName || 'Guest'}</td>
                  <td>{f.rating}</td>
                  <td>{f.comment}</td>
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

export default ReportsDashboard;


