import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerCompany, loginWithGoogle } from '../services/authService';
import { usePageStylesheet } from '../hooks/usePageStylesheet';

const SAMPLE_SLOTS = [
  { id: 'A01', target: 92 },
  { id: 'A02', target: 74 },
  { id: 'A03', target: 81 },
  { id: 'A04', target: 43 },
  { id: 'B01', target: 67 },
  { id: 'B02', target: 88 },
  { id: 'B03', target: 51 },
  { id: 'B04', target: 72 }
];

export default function SignUpPage() {
  const navigate = useNavigate();
  usePageStylesheet('/css/sigin.css');
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [warehouseCount, setWarehouseCount] = useState(3);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState('');
  const googleBtnRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const clientId = window.__GOOGLE_CLIENT_ID__ || '304461158169-1ibf3i818r8a40hlrbtf1iub6b8tf8la.apps.googleusercontent.com';

    const renderGoogleBtn = () => {
      if (!isMounted || !googleBtnRef.current || !window.google?.accounts?.id) return;
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (!response?.credential) {
              setError('Google registration was cancelled.');
              return;
            }
            setLoading(true);
            const result = await loginWithGoogle(response.credential, 'company-admin');
            setLoading(false);
            if (result.ok) {
              navigate('/company-dashboard');
            } else {
              setError(result.message || 'Google registration was declined.');
            }
          },
          auto_select: false
        });

        googleBtnRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          type: 'standard',
          shape: 'rectangular',
          theme: 'outline',
          text: 'signup_with',
          size: 'large',
          logo_alignment: 'left',
          width: 320
        });
      } catch (err) {
        console.warn('Google Signup Render Error:', err);
      }
    };

    if (window.google?.accounts?.id) {
      renderGoogleBtn();
    } else {
      const existing = document.getElementById('gsi-script');
      if (!existing) {
        const script = document.createElement('script');
        script.id = 'gsi-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = renderGoogleBtn;
        document.head.appendChild(script);
      } else {
        existing.addEventListener('load', renderGoogleBtn);
      }
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!companyName.trim()) {
      setError('Please provide your official company name.');
      return;
    }
    if (!contactName.trim()) {
      setError('Please provide a contact person name.');
      return;
    }
    if (!workEmail.trim() || !workEmail.includes('@')) {
      setError('Please provide a valid business email.');
      return;
    }
    if (!warehouseCount || warehouseCount < 1) {
      setError('Please specify at least 1 warehouse to manage.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    setLoading(true);
    const result = await registerCompany({
      companyName: companyName.trim(),
      contactName: contactName.trim(),
      workEmail: workEmail.trim(),
      warehouseCount: Number(warehouseCount),
      password
    });
    setLoading(false);

    if (result.ok) {
      setReference(result.reference || `OV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
      setSubmitted(true);
    } else {
      setError(result.message || 'Registration could not be completed. Please try again.');
    }
  };

  return (
    <div className="signin-page-root">
      <div className="page-grid" aria-hidden="true"></div>

      <header className="signin-header">
        <Link to="/" className="logo">
          OPTI<span>VAULT</span>
        </Link>
        <div className="header-status">
          <span className="status-item">
            <span className="dot"></span> ACCEPTING REGISTRATIONS
          </span>
          <span className="sep">·</span>
          <span className="status-item">REVIEWED IN 2 WORKING DAYS</span>
          <span className="sep">·</span>
          <Link to="/" className="back-link">
            BACK TO SITE
          </Link>
        </div>
      </header>

      <main className="signin-main">
        <div className="signin-inner">
          {/* LEFT: Pitch */}
          <section className="pitch reveal">
            <h1>
              Register once.<br />
              Run every warehouse<br />
              on <span className="accent">one</span> engine.
            </h1>
            <p className="sub">
              Tell us about your company and the warehouses you want us to manage. We review each registration before opening the workspace.
            </p>

            <div className="zone-panel">
              <div className="zone-row">
                <span className="zone-label">
                  SAMPLE ZONE <span className="dash">—</span> AFTER ALLOCATION
                </span>
                <span className="zone-label occ">
                  OCCUPANCY <strong>72%</strong>
                </span>
              </div>

              <div className="slot-cards">
                {SAMPLE_SLOTS.map(slot => (
                  <div className="scard" key={slot.id} data-target={slot.target}>
                    <div className="scard-label">{slot.id}</div>
                    <div className="scard-pct">{slot.target}%</div>
                    <div className="scard-bar">
                      <i style={{ width: `${slot.target}%` }}></i>
                    </div>
                  </div>
                ))}
              </div>

              <div className="zone-foot">
                <span>48 PALLET POSITIONS</span>
                <span>AVG PICK PATH <strong>61 M</strong></span>
              </div>
            </div>
          </section>

          {/* RIGHT: Registration Card */}
          <section className="auth-card signup-card reveal">
            <div className="eyebrow">COMPANY REGISTRATION</div>
            <h2>Register your company</h2>
            <p className="sub">
              One account per company. Your supervisors sign in with this same email, then unlock their own warehouse with its passcode.
            </p>

            <div className="approval-note">
              <span className="mark"></span>
              <span>
                Registrations are reviewed before the workspace opens, because we set up your rack profile and slot map before allocation can run.
              </span>
            </div>

            {error && (
              <div className="form-error show" role="alert" style={{ display: 'block', marginBottom: 16 }}>
                {error}
              </div>
            )}

            {/* Google Registration Option */}
            <div className="google-auth-box" id="googleAuthBox" style={{ marginBottom: 20 }}>
              <div
                ref={googleBtnRef}
                id="googleBtnHost"
                style={{ display: 'flex', justifyContent: 'center', minHeight: 44 }}
              >
                <button
                  type="button"
                  className="google-btn-fake"
                  onClick={() => {
                    if (!window.google?.accounts?.id) {
                      setError('Google Sign-In is initializing. Please verify network access.');
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    width: '100%',
                    maxWidth: 320,
                    padding: '9px 16px',
                    background: '#ffffff',
                    border: '1px solid #dadce0',
                    borderRadius: 4,
                    fontFamily: 'inherit',
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#3c4043',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z" />
                    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
                    <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.347 2.825.957 4.039l3.007-2.332z" />
                    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" />
                  </svg>
                  <span>Sign up with Google</span>
                </button>
              </div>
              <div
                className="auth-divider"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  textAlign: 'center',
                  margin: '18px 0 10px',
                  color: '#8e877e',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.1em'
                }}
              >
                <span style={{ flex: 1, borderBottom: '1px solid #e2ddd5' }}></span>
                <span style={{ padding: '0 10px' }}>OR REGISTER WITH FORM</span>
                <span style={{ flex: 1, borderBottom: '1px solid #e2ddd5' }}></span>
              </div>
            </div>

            <form id="signupForm" onSubmit={handleSubmit} noValidate>
              <label className="field-label" htmlFor="companyName">
                COMPANY NAME
              </label>
              <input
                type="text"
                id="companyName"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="Enter the company name"
                autoComplete="organization"
                required
              />

              <label className="field-label" htmlFor="contactName">
                CONTACT PERSON
              </label>
              <input
                type="text"
                id="contactName"
                value={contactName}
                onChange={e => setContactName(e.target.value)}
                placeholder="Full name"
                autoComplete="name"
                required
              />

              <label className="field-label" htmlFor="workEmail">
                COMPANY EMAIL
              </label>
              <input
                type="email"
                id="workEmail"
                value={workEmail}
                onChange={e => setWorkEmail(e.target.value)}
                placeholder="Enter the email"
                autoComplete="email"
                required
              />
              <div className="field-hint">THIS BECOMES THE SINGLE SIGN-IN FOR YOUR COMPANY</div>

              <label className="field-label" htmlFor="warehouseCount">
                WAREHOUSES TO MANAGE
              </label>
              <input
                type="number"
                id="warehouseCount"
                value={warehouseCount}
                onChange={e => setWarehouseCount(e.target.value)}
                placeholder="3"
                min="1"
                max="99"
                required
              />

              <div className="field-pair">
                <div>
                  <label className="field-label" htmlFor="newPassword">
                    PASSWORD
                  </label>
                  <div className="pw-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="newPassword"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="pw-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path d="M2.5 2.5l15 15M8.3 8.4a2.6 2.6 0 0 0 3.4 3.4M5.6 5.7C3.4 7 1 10 1 10s3.5 6 9 6c1.4 0 2.7-.4 3.8-1M12.3 4.3C11.6 4.1 10.8 4 10 4c-5.5 0-9 6-9 6" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path d="M1 10s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
                          <circle cx="10" cy="10" r="2.6" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="field-label" htmlFor="confirmPassword">
                    CONFIRM PASSWORD
                  </label>
                  <div className="pw-wrap">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="pw-toggle"
                      onClick={() => setShowConfirm(!showConfirm)}
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    >
                      {showConfirm ? (
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path d="M2.5 2.5l15 15M8.3 8.4a2.6 2.6 0 0 0 3.4 3.4M5.6 5.7C3.4 7 1 10 1 10s3.5 6 9 6c1.4 0 2.7-.4 3.8-1M12.3 4.3C11.6 4.1 10.8 4 10 4c-5.5 0-9 6-9 6" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path d="M1 10s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
                          <circle cx="10" cy="10" r="2.6" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" className="enter-btn" disabled={loading}>
                <span className="btn-text">
                  {loading ? 'TRANSMITTING REGISTRATION…' : 'SEND REGISTRATION'}
                </span>
                <span className="btn-arrow">→</span>
              </button>

              <div className="form-row form-row-bottom">
                <span className="sub small">Already registered?</span>
                <Link to="/signin" className="register-link">
                  SIGN IN
                </Link>
              </div>
            </form>

            <div className="secure-note">
              <span className="mark"></span> SECURE ORGANIZATIONAL ACCESS
            </div>
          </section>
        </div>
      </main>

      {/* SUCCESS SCREEN MODAL */}
      {submitted && (
        <div className="success-screen on" style={{ display: 'flex' }}>
          <div className="success-message show" style={{ margin: 'auto' }}>
            <div className="success-eyebrow">Registration received</div>
            <h2 className="success-title">
              We'll get in touch<br />with you <span className="accent">soon</span>.
            </h2>
            <p className="success-sub">
              Thanks, <strong>{companyName}</strong>. Our platform team will review your warehouses and set up your rack profile before opening the workspace. You'll hear from us at {workEmail}.
            </p>
            <div className="success-actions">
              <Link to="/" className="success-btn solid">
                BACK TO SITE
              </Link>
              <Link to="/signin" className="success-btn ghost">
                GO TO SIGN IN
              </Link>
            </div>
            <p className="success-ref">
              REFERENCE <code>{reference}</code>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
