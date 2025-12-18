import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { useAuth } from '../../context/AuthContext.jsx';
import { validateEmail, validatePassword } from '../../utils/validations.js';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

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

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (value) {
      const passwordError = validatePassword(value);
      setErrors({ ...errors, password: passwordError });
    } else {
      setErrors({ ...errors, password: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate all fields
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    const newErrors = {
      email: emailError,
      password: passwordError,
    };
    
    setErrors(newErrors);
    
    if (emailError || passwordError) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }
      login({
        user: {
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
        },
        token: data.token,
      });
      // Redirect based on role
      if (data.role === 'user') {
        navigate('/dashboard/user', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
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
        <p className="subtitle">Secure staff login</p>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
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
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={handlePasswordChange}
              onBlur={handlePasswordChange}
              required
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && <p className="field-error-text">{errors.password}</p>}
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>
        <p className="switch-text" style={{ textAlign: 'center', marginTop: '10px' }}>
          <a href="/forgot-password" style={{ color: '#564ade', textDecoration: 'underline' }}>
            Forgot Password?
          </a>
        </p>
        <p className="switch-text">
          First time here? <a href="/register">Create account</a>
        </p>
      </div>
    </div>
  );
};

export default Login;


