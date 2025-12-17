import { useEffect, useState } from 'react';
import { useApiClient } from '../utils/apiClient.js';
import { useAuth } from '../context/AuthContext.jsx';
import './Settings.css';
import { validateName, validateEmail, validatePassword } from '../utils/validations.js';

const Settings = () => {
  const { apiFetch } = useApiClient();
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleProfileChange = (field, value) => {
    setProfileForm({ ...profileForm, [field]: value });
    
    // Real-time validation
    let fieldError = '';
    if (field === 'name') {
      fieldError = validateName(value);
    } else if (field === 'email') {
      fieldError = validateEmail(value);
    }
    
    setProfileErrors({ ...profileErrors, [field]: fieldError });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Validate all fields
    const nameError = validateName(profileForm.name);
    const emailError = validateEmail(profileForm.email);
    
    const newErrors = {
      name: nameError,
      email: emailError,
    };
    
    setProfileErrors(newErrors);
    
    if (nameError || emailError) {
      setLoading(false);
      return;
    }

    try {
      const updatedUser = await apiFetch('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileForm),
      });

      // Update auth context
      const stored = localStorage.getItem('lux_auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        login({
          user: { ...parsed.user, ...updatedUser },
          token: parsed.token,
        });
      }

      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordFormChange = (field, value) => {
    setPasswordForm({ ...passwordForm, [field]: value });
    
    // Real-time validation
    let fieldError = '';
    if (field === 'newPassword') {
      fieldError = validatePassword(value);
    } else if (field === 'confirmPassword') {
      if (value && value !== passwordForm.newPassword) {
        fieldError = 'Passwords match nahi kar rahe';
      }
    }
    
    setPasswordErrors({ ...passwordErrors, [field]: fieldError });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate all fields
    const currentPasswordError = validatePassword(passwordForm.currentPassword);
    const newPasswordError = validatePassword(passwordForm.newPassword);
    const confirmPasswordError = passwordForm.newPassword !== passwordForm.confirmPassword 
      ? 'Passwords match nahi kar rahe' 
      : '';
    
    const newErrors = {
      currentPassword: currentPasswordError,
      newPassword: newPasswordError,
      confirmPassword: confirmPasswordError,
    };
    
    setPasswordErrors(newErrors);
    
    if (currentPasswordError || newPasswordError || confirmPasswordError) {
      setLoading(false);
      return;
    }

    try {
      await apiFetch('/api/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      setSuccess('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">Manage your account settings and preferences</p>
      </div>

      <div className="settings-tabs">
        <button
          className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={`settings-tab ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          Change Password
        </button>
        <button
          className={`settings-tab ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          Account Info
        </button>
      </div>

      <div className="settings-content">
        {error && (
          <div className="settings-alert settings-alert-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="settings-alert settings-alert-success">
            <span>✅</span>
            <span>{success}</span>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="settings-section">
            <h2 className="settings-section-title">Profile Information</h2>
            <p className="settings-section-description">
              Update your personal information and contact details.
            </p>

            <form onSubmit={handleProfileUpdate} className="settings-form">
              <div className="settings-form-group">
                <label htmlFor="name" className="settings-label">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  className={`settings-input ${profileErrors.name ? 'input-error' : ''}`}
                  value={profileForm.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                  onBlur={(e) => handleProfileChange('name', e.target.value)}
                  required
                />
                {profileErrors.name && (
                  <p className="field-error-text" style={{ marginTop: '4px' }}>{profileErrors.name}</p>
                )}
              </div>

              <div className="settings-form-group">
                <label htmlFor="email" className="settings-label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className={`settings-input ${profileErrors.email ? 'input-error' : ''}`}
                  value={profileForm.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  onBlur={(e) => handleProfileChange('email', e.target.value)}
                  required
                />
                {profileErrors.email && (
                  <p className="field-error-text" style={{ marginTop: '4px' }}>{profileErrors.email}</p>
                )}
              </div>

              <div className="settings-form-actions">
                <button
                  type="submit"
                  className="settings-button settings-button-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="settings-section">
            <h2 className="settings-section-title">Change Password</h2>
            <p className="settings-section-description">
              Update your password to keep your account secure.
            </p>

            <form onSubmit={handlePasswordChange} className="settings-form">
              <div className="settings-form-group">
                <label htmlFor="currentPassword" className="settings-label">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  className={`settings-input ${passwordErrors.currentPassword ? 'input-error' : ''}`}
                  value={passwordForm.currentPassword}
                  onChange={(e) => handlePasswordFormChange('currentPassword', e.target.value)}
                  onBlur={(e) => handlePasswordFormChange('currentPassword', e.target.value)}
                  required
                />
                {passwordErrors.currentPassword && (
                  <p className="field-error-text" style={{ marginTop: '4px' }}>{passwordErrors.currentPassword}</p>
                )}
              </div>

              <div className="settings-form-group">
                <label htmlFor="newPassword" className="settings-label">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  className={`settings-input ${passwordErrors.newPassword ? 'input-error' : ''}`}
                  value={passwordForm.newPassword}
                  onChange={(e) => {
                    handlePasswordFormChange('newPassword', e.target.value);
                    // Re-validate confirm password if it has a value
                    if (passwordForm.confirmPassword) {
                      handlePasswordFormChange('confirmPassword', passwordForm.confirmPassword);
                    }
                  }}
                  onBlur={(e) => handlePasswordFormChange('newPassword', e.target.value)}
                  required
                  minLength={6}
                />
                {passwordErrors.newPassword && (
                  <p className="field-error-text" style={{ marginTop: '4px' }}>{passwordErrors.newPassword}</p>
                )}
                <small className="settings-hint">
                  Password must be at least 6 characters long
                </small>
              </div>

              <div className="settings-form-group">
                <label htmlFor="confirmPassword" className="settings-label">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className={`settings-input ${passwordErrors.confirmPassword ? 'input-error' : ''}`}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => handlePasswordFormChange('confirmPassword', e.target.value)}
                  onBlur={(e) => handlePasswordFormChange('confirmPassword', e.target.value)}
                  required
                />
                {passwordErrors.confirmPassword && (
                  <p className="field-error-text" style={{ marginTop: '4px' }}>{passwordErrors.confirmPassword}</p>
                )}
              </div>

              <div className="settings-form-actions">
                <button
                  type="submit"
                  className="settings-button settings-button-primary"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="settings-section">
            <h2 className="settings-section-title">Account Information</h2>
            <p className="settings-section-description">
              View your account details and role information.
            </p>

            <div className="settings-account-info">
              <div className="settings-info-item">
                <span className="settings-info-label">User ID:</span>
                <span className="settings-info-value">{user?._id || 'N/A'}</span>
              </div>
              <div className="settings-info-item">
                <span className="settings-info-label">Name:</span>
                <span className="settings-info-value">{user?.name || 'N/A'}</span>
              </div>
              <div className="settings-info-item">
                <span className="settings-info-label">Email:</span>
                <span className="settings-info-value">{user?.email || 'N/A'}</span>
              </div>
              <div className="settings-info-item">
                <span className="settings-info-label">Role:</span>
                <span className="settings-info-value settings-role-badge">
                  {user?.role || 'N/A'}
                </span>
              </div>
              <div className="settings-info-item">
                <span className="settings-info-label">Status:</span>
                <span className="settings-info-value settings-status-active">
                  Active
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;

