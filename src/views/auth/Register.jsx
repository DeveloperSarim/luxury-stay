import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { useAuth } from '../../context/AuthContext.jsx';
import { validateEmail, validatePassword, validateName } from '../../utils/validations.js';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role] = useState('user'); // Default role is 'user', no dropdown
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    if (value) {
      const nameError = validateName(value);
      setErrors({ ...errors, name: nameError });
    } else {
      setErrors({ ...errors, name: '' });
    }
  };

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
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    const newErrors = {
      name: nameError,
      email: emailError,
      password: passwordError,
    };
    
    setErrors(newErrors);
    
    if (nameError || emailError || passwordError) {
      return;
    }
    
    setLoading(true);
    try {
      // User registration endpoint
      const res = await fetch('https://luxury-stay-backend.vercel.app/api/auth/register-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'user' }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      if (data.token) {
        login({
          user: {
            _id: data._id,
            name: data.name,
            email: data.email,
            role: data.role,
          },
          token: data.token,
        });
        // Redirect to user dashboard
        navigate('/dashboard/user', { replace: true });
      } else {
        navigate('/login', { replace: true });
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
        <p className="subtitle">Create your account</p>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Name</label>
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={handleNameChange}
              onBlur={handleNameChange}
              required
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && <p className="field-error-text">{errors.name}</p>}
          </div>
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
              placeholder="Strong password"
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
            {loading ? 'Registering…' : 'Register & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;


