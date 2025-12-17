import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import './Login.css';
import { validatePassword } from '../../utils/validations.js';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (value) {
      const passwordError = validatePassword(value);
      setErrors({ ...errors, password: passwordError });
    } else {
      setErrors({ ...errors, password: '' });
    }
    
    // Check if passwords match
    if (confirmPassword && value !== confirmPassword) {
      setErrors({ ...errors, confirmPassword: 'Passwords do not match' });
    } else if (confirmPassword && value === confirmPassword) {
      setErrors({ ...errors, confirmPassword: '' });
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (value && value !== password) {
      setErrors({ ...errors, confirmPassword: 'Passwords do not match' });
    } else {
      setErrors({ ...errors, confirmPassword: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    // Validate
    const passwordError = validatePassword(password);
    const confirmPasswordError = password !== confirmPassword ? 'Passwords do not match' : '';
    
    const newErrors = {
      password: passwordError,
      confirmPassword: confirmPasswordError,
    };
    
    setErrors(newErrors);
    
    if (passwordError || confirmPasswordError || !token) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('https://luxury-stay-backend.vercel.app/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="hms-login">
        <div className="hms-login-card">
          <div className="login-logo-wrapper">
            <img src="/Luxury-Stay-Logo.png" alt="Luxury Stay" className="login-logo" />
          </div>
          <h1>Invalid Reset Link</h1>
          <p className="subtitle">This password reset link is invalid or expired</p>
          <Link to="/forgot-password" className="primary-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: '20px' }}>
            Request New Reset Link
          </Link>
          <p className="switch-text">
            <Link to="/login">Back to Login</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="hms-login">
      <div className="hms-login-card">
        <div className="login-logo-wrapper">
          <img src="/Luxury-Stay-Logo.png" alt="Luxury Stay" className="login-logo" />
        </div>
        <h1>Reset Password</h1>
        <p className="subtitle">Enter your new password</p>
        
        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px', color: '#059669' }}>✓</div>
            <h3 style={{ color: '#059669', marginBottom: '10px' }}>Password Reset Successful!</h3>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>
              Your password has been reset successfully. Redirecting to login...
            </p>
            <Link to="/login" className="primary-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
              Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={handlePasswordChange}
                onBlur={handlePasswordChange}
                required
                className={errors.password ? 'input-error' : ''}
              />
              {errors.password && <p className="field-error-text">{errors.password}</p>}
            </div>
            <div className="field">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                onBlur={handleConfirmPasswordChange}
                required
                className={errors.confirmPassword ? 'input-error' : ''}
              />
              {errors.confirmPassword && <p className="field-error-text">{errors.confirmPassword}</p>}
            </div>
            {error && <p className="error-text">{error}</p>}
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
        
        <p className="switch-text">
          Remember your password? <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;

