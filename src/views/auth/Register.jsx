import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { useAuth } from '../../context/AuthContext.jsx';
import { validateEmail, validatePassword, validateName, validatePhone } from '../../utils/validations.js';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+92'); // Default Pakistan
  const [countryFlag, setCountryFlag] = useState('🇵🇰'); // Default Pakistan flag
  const [role, setRole] = useState('user'); // Role selection
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Auto-detect country code based on browser timezone/locale
  useEffect(() => {
    const detectCountry = () => {
      try {
        // Try to get country from timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const countryMap = {
          'Asia/Karachi': { code: '+92', flag: '🇵🇰', name: 'Pakistan' },
          'Asia/Islamabad': { code: '+92', flag: '🇵🇰', name: 'Pakistan' },
          'Asia/Dubai': { code: '+971', flag: '🇦🇪', name: 'UAE' },
          'Asia/Riyadh': { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
          'America/New_York': { code: '+1', flag: '🇺🇸', name: 'USA' },
          'Europe/London': { code: '+44', flag: '🇬🇧', name: 'UK' },
        };
        
        const detected = countryMap[timezone] || { code: '+92', flag: '🇵🇰', name: 'Pakistan' };
        setCountryCode(detected.code);
        setCountryFlag(detected.flag);
      } catch (err) {
        // Default to Pakistan
        setCountryCode('+92');
        setCountryFlag('🇵🇰');
      }
    };
    
    detectCountry();
  }, []);

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

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    setPhone(value);
    if (value) {
      // For Pakistan: country code (+92) + 10 digits
      const fullPhone = countryCode + value;
      const phoneError = validatePhone(fullPhone);
      setErrors({ ...errors, phone: phoneError });
    } else {
      setErrors({ ...errors, phone: '' });
    }
  };

  const handleCountryCodeChange = (e) => {
    const selected = e.target.value;
    const [code, flag] = selected.split('|');
    setCountryCode(code);
    setCountryFlag(flag);
    // Re-validate phone if it exists
    if (phone) {
      const fullPhone = code + phone;
      const phoneError = validatePhone(fullPhone);
      setErrors({ ...errors, phone: phoneError });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate all fields
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const fullPhone = countryCode + phone;
    const phoneError = phone ? validatePhone(fullPhone) : '';
    
    const newErrors = {
      name: nameError,
      email: emailError,
      password: passwordError,
      phone: phoneError,
    };
    
    setErrors(newErrors);
    
    if (nameError || emailError || passwordError || phoneError) {
      return;
    }
    
    setLoading(true);
    try {
      // User registration endpoint
      const res = await fetch('http://localhost:5000/api/auth/register-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone: fullPhone, role }),
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
        // Redirect based on role
        if (data.role === 'admin' || data.role === 'manager') {
          navigate('/dashboard/admin', { replace: true });
        } else {
          navigate('/dashboard/user', { replace: true });
        }
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
          <div className="field">
            <label>Phone Number</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
              <select
                value={`${countryCode}|${countryFlag}`}
                onChange={handleCountryCodeChange}
                className={errors.phone ? 'input-error' : ''}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: errors.phone ? '1px solid #ef4444' : '1px solid #d1d5db',
                  fontSize: '14px',
                  background: '#ffffff',
                  cursor: 'pointer',
                  minWidth: '110px',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#564ade';
                  e.target.style.boxShadow = '0 0 0 3px rgba(86, 74, 222, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.phone ? '#ef4444' : '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="+92|🇵🇰">🇵🇰 +92</option>
                <option value="+1|🇺🇸">🇺🇸 +1</option>
                <option value="+44|🇬🇧">🇬🇧 +44</option>
                <option value="+971|🇦🇪">🇦🇪 +971</option>
                <option value="+966|🇸🇦">🇸🇦 +966</option>
                <option value="+91|🇮🇳">🇮🇳 +91</option>
                <option value="+86|🇨🇳">🇨🇳 +86</option>
                <option value="+33|🇫🇷">🇫🇷 +33</option>
                <option value="+49|🇩🇪">🇩🇪 +49</option>
                <option value="+81|🇯🇵">🇯🇵 +81</option>
              </select>
              <input
                type="tel"
                placeholder={countryCode === '+92' ? '3001234567' : 'Phone number'}
                value={phone}
                onChange={handlePhoneChange}
                onBlur={handlePhoneChange}
                required
                maxLength={countryCode === '+92' ? 10 : 15}
                className={errors.phone ? 'input-error' : ''}
                style={{ flex: 1 }}
              />
            </div>
            {errors.phone && <p className="field-error-text">{errors.phone}</p>}
            {countryCode === '+92' && !errors.phone && phone && (
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                10 digits required (without country code)
              </p>
            )}
          </div>
          <div className="field">
            <label>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                outline: 'none',
                background: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#564ade';
                e.target.style.boxShadow = '0 0 0 3px rgba(86, 74, 222, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="user">User / Guest</option>
              <option value="admin">Admin / Manager</option>
              <option value="receptionist">Receptionist</option>
              <option value="housekeeping">Housekeeping</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              Select your role (Admin/Manager aur Guest users ke liye options available hain)
            </p>
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


