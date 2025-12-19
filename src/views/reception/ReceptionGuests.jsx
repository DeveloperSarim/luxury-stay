import { useEffect, useState } from 'react';
import '../Dashboard.css';
import { useApiClient } from '../../utils/apiClient.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { validateName, validateEmail, validatePhone, validatePassword } from '../../utils/validations.js';

const ReceptionGuests = () => {
  const { apiFetch } = useApiClient();
  const { user } = useAuth();
  const [guests, setGuests] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [editingGuest, setEditingGuest] = useState(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [editFormErrors, setEditFormErrors] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState('');

  const loadGuests = async () => {
    const data = await apiFetch('/api/guests');
    setGuests(data);
  };

  useEffect(() => {
    loadGuests().catch((err) => setError(err.message));
  }, []);

  const handleFormChange = (field, value) => {
    setForm({ ...form, [field]: value });
    
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
    
    setFormErrors({ ...formErrors, [field]: fieldError });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate all fields
    const firstNameError = validateName(form.firstName);
    const lastNameError = form.lastName ? validateName(form.lastName) : '';
    const emailError = form.email ? validateEmail(form.email) : '';
    const phoneError = form.phone ? validatePhone(form.phone) : '';
    const passwordError = validatePassword(form.password);
    
    const newErrors = {
      firstName: firstNameError,
      lastName: lastNameError,
      email: emailError,
      phone: phoneError,
      password: passwordError,
    };
    
    setFormErrors(newErrors);
    
    if (firstNameError || lastNameError || emailError || phoneError || passwordError) {
      return;
    }
    
    try {
      await apiFetch('/api/guests', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm({ firstName: '', lastName: '', email: '', phone: '', password: '' });
      setFormErrors({});
      await loadGuests();
    } catch (err) {
      setError(err.message);
    }
  };

  const filtered = guests.filter((g) =>
    `${g.firstName} ${g.lastName || ''} ${g.email || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleEditGuest = (guest) => {
    setEditingGuest(guest);
    setEditForm({
      firstName: guest.firstName || '',
      lastName: guest.lastName || '',
      email: guest.email || '',
      phone: guest.phone || '',
    });
    setShowEditModal(true);
    setError('');
  };

  const handleEditFormChange = (field, value) => {
    setEditForm({ ...editForm, [field]: value });
    
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
    }
    
    setEditFormErrors({ ...editFormErrors, [field]: fieldError });
  };

  const handleUpdateGuest = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate all fields
    const firstNameError = validateName(editForm.firstName);
    const lastNameError = editForm.lastName ? validateName(editForm.lastName) : '';
    const emailError = editForm.email ? validateEmail(editForm.email) : '';
    const phoneError = editForm.phone ? validatePhone(editForm.phone) : '';
    
    const newErrors = {
      firstName: firstNameError,
      lastName: lastNameError,
      email: emailError,
      phone: phoneError,
    };
    
    setEditFormErrors(newErrors);
    
    if (firstNameError || lastNameError || emailError || phoneError) {
      return;
    }
    
    try {
      await apiFetch(`/api/guests/${editingGuest._id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });
      await loadGuests();
      setShowEditModal(false);
      setEditingGuest(null);
      setEditFormErrors({});
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteGuest = async (id) => {
    if (!window.confirm('Kya aap is guest ko delete karna chahte hain?')) {
      return;
    }
    setError('');
    try {
      await apiFetch(`/api/guests/${id}`, {
        method: 'DELETE',
      });
      await loadGuests();
    } catch (err) {
      setError(err.message);
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <section className="card metric">
          <h3>Total Guests</h3>
          <p className="metric-value">{guests.length}</p>
          <span className="metric-label">Registered guests</span>
        </section>
        <section className="card metric">
          <h3>Search Results</h3>
          <p className="metric-value">{filtered.length}</p>
          <span className="metric-label">Matching guests</span>
        </section>
      </div>

      <section className="card table-card">
        <div className="card-header">
          <h3>Guests Directory</h3>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Registered</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    {search ? 'No guests found matching your search' : 'No guests registered yet'}
                  </td>
                </tr>
              ) : (
                filtered.map((g) => (
                  <tr key={g._id}>
                    <td>
                      <strong>{g.firstName} {g.lastName || ''}</strong>
                    </td>
                    <td>{g.email || '-'}</td>
                    <td>{g.phone || '-'}</td>
                    <td>
                      {g.createdAt 
                        ? new Date(g.createdAt).toLocaleDateString() 
                        : '-'}
                    </td>
                    {isAdmin && (
                      <td>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="table-btn"
                            onClick={() => handleEditGuest(g)}
                            style={{ background: '#10b981', borderColor: '#10b981' }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="table-btn"
                            onClick={() => handleDeleteGuest(g._id)}
                            style={{ background: '#ef4444', borderColor: '#ef4444' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card table-card">
        <div className="card-header">
          <h3>Add Guest</h3>
        </div>
        <form className="staff-form" onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              placeholder="First name"
              value={form.firstName}
              onChange={(e) => handleFormChange('firstName', e.target.value)}
              onBlur={(e) => handleFormChange('firstName', e.target.value)}
              required
              className={formErrors.firstName ? 'input-error' : ''}
            />
            {formErrors.firstName && <p className="field-error-text">{formErrors.firstName}</p>}
          </div>
          <div>
            <input
              type="text"
              placeholder="Last name"
              value={form.lastName}
              onChange={(e) => handleFormChange('lastName', e.target.value)}
              onBlur={(e) => handleFormChange('lastName', e.target.value)}
              className={formErrors.lastName ? 'input-error' : ''}
            />
            {formErrors.lastName && <p className="field-error-text">{formErrors.lastName}</p>}
          </div>
          <div>
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => handleFormChange('email', e.target.value)}
              onBlur={(e) => handleFormChange('email', e.target.value)}
              className={formErrors.email ? 'input-error' : ''}
            />
            {formErrors.email && <p className="field-error-text">{formErrors.email}</p>}
          </div>
          <div>
          <input
            type="text"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => handleFormChange('phone', e.target.value)}
            onBlur={(e) => handleFormChange('phone', e.target.value)}
            className={formErrors.phone ? 'input-error' : ''}
          />
          {formErrors.phone && <p className="field-error-text">{formErrors.phone}</p>}
          </div>
          <div>
            <input
              type="password"
              placeholder="Password *"
              value={form.password}
              onChange={(e) => handleFormChange('password', e.target.value)}
              onBlur={(e) => handleFormChange('password', e.target.value)}
              required
              className={formErrors.password ? 'input-error' : ''}
            />
            {formErrors.password && <p className="field-error-text">{formErrors.password}</p>}
          </div>
          <button type="submit" className="primary-btn">
            Save Guest
          </button>
        </form>
        {error && <p className="error-text">{error}</p>}
      </section>

      {showEditModal && editingGuest && (
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
              <h3 style={{ margin: 0, color: '#111827', fontSize: '20px', fontWeight: 600 }}>Edit Guest</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingGuest(null);
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
            <form onSubmit={handleUpdateGuest} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                  First Name
                </label>
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) => handleEditFormChange('firstName', e.target.value)}
                  onBlur={(e) => handleEditFormChange('firstName', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: editFormErrors.firstName ? '1px solid #dc2626' : '1px solid #d1d5db',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                {editFormErrors.firstName && (
                  <p style={{ color: '#dc2626', fontSize: '11px', marginTop: '4px' }}>
                    {editFormErrors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                  Last Name
                </label>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) => handleEditFormChange('lastName', e.target.value)}
                  onBlur={(e) => handleEditFormChange('lastName', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: editFormErrors.lastName ? '1px solid #dc2626' : '1px solid #d1d5db',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                {editFormErrors.lastName && (
                  <p style={{ color: '#dc2626', fontSize: '11px', marginTop: '4px' }}>
                    {editFormErrors.lastName}
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
                  Phone
                </label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => handleEditFormChange('phone', e.target.value)}
                  onBlur={(e) => handleEditFormChange('phone', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: editFormErrors.phone ? '1px solid #dc2626' : '1px solid #d1d5db',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                {editFormErrors.phone && (
                  <p style={{ color: '#dc2626', fontSize: '11px', marginTop: '4px' }}>
                    {editFormErrors.phone}
                  </p>
                )}
              </div>
              {error && <p style={{ color: '#dc2626', fontSize: '12px', margin: 0 }}>{error}</p>}
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="submit"
                  className="primary-btn"
                  style={{ flex: 1 }}
                >
                  Update Guest
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingGuest(null);
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

export default ReceptionGuests;


