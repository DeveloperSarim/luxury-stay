import { useEffect, useState } from 'react';
import './Dashboard.css';
import { useApiClient } from '../utils/apiClient.js';
import { useAuth } from '../context/AuthContext.jsx';
import { validateName, validateEmail, validatePassword } from '../utils/validations.js';

const AdminDashboard = () => {
  const { apiFetch } = useApiClient();
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'receptionist',
  });
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState('');
  const [editingStaff, setEditingStaff] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'receptionist',
  });
  const [editFormErrors, setEditFormErrors] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setError('');
        const [s, users] = await Promise.all([
          apiFetch('/api/reports/summary'),
          apiFetch('/api/users'),
        ]);
        // Handle null responses (timeout/network errors)
        if (s !== null) {
          setSummary(s);
        }
        if (users !== null && Array.isArray(users)) {
          setStaff(users);
        }
      } catch (err) {
        // Handle timeout errors gracefully
        if (err.message && err.message.includes('timeout')) {
          setError('Connection slow hai. Please wait karein ya refresh karein.');
        } else {
          setError(err.message || 'Data load nahi ho saka. Please try again.');
        }
      }
    };
    load();
  }, [apiFetch]);

  const handleFormChange = (field, value) => {
    setForm({ ...form, [field]: value });
    
    // Real-time validation
    let fieldError = '';
    if (field === 'name') {
      fieldError = validateName(value);
    } else if (field === 'email') {
      fieldError = validateEmail(value);
    } else if (field === 'password') {
      fieldError = validatePassword(value);
    }
    
    setFormErrors({ ...formErrors, [field]: fieldError });
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate all fields
    const nameError = validateName(form.name);
    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password);
    
    const newErrors = {
      name: nameError,
      email: emailError,
      password: passwordError,
    };
    
    setFormErrors(newErrors);
    
    if (nameError || emailError || passwordError) {
      return;
    }
    
    try {
      await apiFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      const updated = await apiFetch('/api/users');
      setStaff(updated);
      setForm({ name: '', email: '', password: '', role: 'receptionist' });
      setFormErrors({});
      } catch (err) {
        // Handle timeout errors gracefully
        if (err.message && err.message.includes('timeout')) {
          setError('Connection slow hai. Please wait karein ya refresh karein.');
        } else {
          setError(err.message || 'Staff create nahi ho saka. Please try again.');
        }
      }
  };

  const handleEditStaff = (staffMember) => {
    setEditingStaff(staffMember);
    setEditForm({
      name: staffMember.name || '',
      email: staffMember.email || '',
      role: staffMember.role || 'receptionist',
    });
    setShowEditModal(true);
    setError('');
  };

  const handleEditFormChange = (field, value) => {
    setEditForm({ ...editForm, [field]: value });
    
    // Real-time validation
    let fieldError = '';
    if (field === 'name') {
      fieldError = validateName(value);
    } else if (field === 'email') {
      fieldError = validateEmail(value);
    }
    
    setEditFormErrors({ ...editFormErrors, [field]: fieldError });
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate all fields
    const nameError = validateName(editForm.name);
    const emailError = validateEmail(editForm.email);
    
    const newErrors = {
      name: nameError,
      email: emailError,
    };
    
    setEditFormErrors(newErrors);
    
    if (nameError || emailError) {
      return;
    }
    
    try {
      await apiFetch(`/api/users/${editingStaff._id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });
      const updated = await apiFetch('/api/users');
      setStaff(updated);
      setShowEditModal(false);
      setEditingStaff(null);
      setEditFormErrors({});
    } catch (err) {
      // Handle timeout errors gracefully
      if (err.message && err.message.includes('timeout')) {
        setError('Connection slow hai. Please wait karein ya refresh karein.');
      } else {
        setError(err.message || 'Staff update nahi ho saka. Please try again.');
      }
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Kya aap is staff member ko permanently delete karna chahte hain? Ye action undo nahi ho sakta.')) {
      return;
    }
    setError('');
    try {
      await apiFetch(`/api/users/${id}`, {
        method: 'DELETE',
      });
      const updated = await apiFetch('/api/users');
      setStaff(updated);
    } catch (err) {
      // Handle timeout errors gracefully
      if (err.message && err.message.includes('timeout')) {
        setError('Connection slow hai. Please wait karein ya refresh karein.');
      } else {
        setError(err.message || 'Staff delete nahi ho saka. Please try again.');
      }
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <section className="card metric">
          <h3>Occupancy</h3>
          <p className="metric-value">
            {summary ? `${summary.occupancyCount} rooms` : '...'}
          </p>
          <span className="metric-label">Current hotel occupancy</span>
        </section>
        <section className="card metric">
          <h3>Revenue</h3>
          <p className="metric-value">
            {summary ? `$${summary.revenue.toLocaleString()}` : '...'}
          </p>
          <span className="metric-label">Total paid invoices</span>
        </section>
        <section className="card metric">
          <h3>Total Reservations</h3>
          <p className="metric-value">
            {summary ? summary.totalReservations : '...'}
          </p>
          <span className="metric-label">All time</span>
        </section>
        <section className="card metric">
          <h3>Guest Rating</h3>
          <p className="metric-value">
            {summary ? summary.avgRating.toFixed(1) : '...'}
          </p>
          <span className="metric-label">Today&apos;s average</span>
        </section>
      </div>

      <section className="card table-card">
        <div className="card-header">
          <h3>Staff Overview</h3>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    No staff members found
                  </td>
                </tr>
              ) : (
                staff.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role === 'admin' || u.role === 'manager' ? 'manager' : u.role}</td>
                    <td>
                      <span className={`status-badge ${u.isActive ? 'status-available' : 'status-cancelled'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {u.role !== 'admin' && u.role !== 'manager' && (
                          <>
                            <button
                              type="button"
                              className="table-btn"
                              onClick={() => handleEditStaff(u)}
                              style={{ background: '#10b981', borderColor: '#10b981' }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="table-btn"
                              onClick={() => handleDeleteStaff(u._id)}
                              style={{ background: '#ef4444', borderColor: '#ef4444' }}
                            >
                              Delete
                            </button>
                          </>
                        )}
                        {(u.role === 'admin' || u.role === 'manager') && (
                          <span style={{ color: '#6b7280', fontSize: '14px' }}>Protected</span>
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

      {(user?.role === 'admin' || user?.role === 'manager') && (
        <section className="card table-card">
          <div className="card-header">
            <h3>Create Staff</h3>
          </div>
          <form className="staff-form" onSubmit={handleCreateStaff}>
            <div>
              <input
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                onBlur={(e) => handleFormChange('name', e.target.value)}
                required
                className={formErrors.name ? 'input-error' : ''}
              />
              {formErrors.name && <p className="field-error-text">{formErrors.name}</p>}
            </div>
            <div>
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
                onBlur={(e) => handleFormChange('email', e.target.value)}
                required
                className={formErrors.email ? 'input-error' : ''}
              />
              {formErrors.email && <p className="field-error-text">{formErrors.email}</p>}
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => handleFormChange('password', e.target.value)}
                onBlur={(e) => handleFormChange('password', e.target.value)}
                required
                className={formErrors.password ? 'input-error' : ''}
              />
              {formErrors.password && <p className="field-error-text">{formErrors.password}</p>}
            </div>
            <div>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="manager">Manager</option>
                <option value="receptionist">Receptionist</option>
                <option value="housekeeping">Housekeeping</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <button type="submit" className="primary-btn">
              Add Staff
            </button>
          </form>
          {error && <p className="error-text">{error}</p>}
        </section>
      )}

      {showEditModal && editingStaff && (
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
              <h3 style={{ margin: 0, color: '#111827', fontSize: '20px', fontWeight: 600 }}>Edit Staff</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingStaff(null);
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
            <form onSubmit={handleUpdateStaff} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                  Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => handleEditFormChange('name', e.target.value)}
                  onBlur={(e) => handleEditFormChange('name', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: editFormErrors.name ? '1px solid #dc2626' : '1px solid #d1d5db',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                {editFormErrors.name && (
                  <p style={{ color: '#dc2626', fontSize: '11px', marginTop: '4px' }}>
                    {editFormErrors.name}
                  </p>
                )}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => handleEditFormChange('email', e.target.value)}
                  onBlur={(e) => handleEditFormChange('email', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: editFormErrors.email ? '1px solid #dc2626' : '1px solid #d1d5db',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                {editFormErrors.email && (
                  <p style={{ color: '#dc2626', fontSize: '11px', marginTop: '4px' }}>
                    {editFormErrors.email}
                  </p>
                )}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                  Role
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
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
                  <option value="manager">Manager</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="housekeeping">Housekeeping</option>
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
                  Update Staff
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingStaff(null);
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

export default AdminDashboard;


