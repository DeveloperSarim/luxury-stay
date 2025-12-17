import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
import { validateEmail } from '../../utils/validations.js';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState('');
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value) {
      const emailError = validateEmail(value);
      setErrors({ ...errors, email: emailError });
    } else {
      setErrors({ ...errors, email: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    // Validate email
    const emailError = validateEmail(email);
    
    const newErrors = {
      email: emailError,
    };
    
    setErrors(newErrors);
    
    if (emailError) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send reset email');
      }
      setSuccess(true);
      setEmail('');
      // Store reset link if provided (development mode)
      if (data.resetLink) {
        setResetLink(data.resetLink);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hms-login">
      <div className="hms-login-card">
        <div className="login-logo-wrapper">
          <img src="/Luxury-Stay-Logo.png" alt="Luxury Stay" className="login-logo" />
        </div>
        <h1>LuxuryStay HMS</h1>
        <p className="subtitle">Reset your password</p>
        
        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>✓</div>
            <h3 style={{ color: '#059669', marginBottom: '10px' }}>Email Sent!</h3>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>
              Password reset link apke email par bhej diya gaya hai. 
              Please check your inbox.
            </p>
            {resetLink && (
              <div style={{ 
                background: '#f3f4f6', 
                padding: '15px', 
                borderRadius: '8px', 
                marginBottom: '20px',
                textAlign: 'left'
              }}>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                  <strong>Development Mode:</strong> Reset link (if email not received):
                </p>
                <a 
                  href={resetLink} 
                  style={{ 
                    fontSize: '12px', 
                    color: '#564ade', 
                    wordBreak: 'break-all',
                    textDecoration: 'underline'
                  }}
                >
                  {resetLink}
                </a>
              </div>
            )}
            <Link to="/login" className="primary-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailChange}
                required
                className={errors.email ? 'input-error' : ''}
              />
              {errors.email && <p className="field-error-text">{errors.email}</p>}
            </div>
            {error && <p className="error-text">{error}</p>}
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPassword;

