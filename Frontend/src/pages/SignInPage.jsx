import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { loginUser, loginWithGoogle, ROLE_DESTINATIONS } from '../services/authService';
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

const ROLE_INFO = {
  'company-admin': {
    badge: 'COMPANY ADMIN',
    title: 'Company Admin',
    desc: 'Routes to multi-facility overview & facility ledger.',
    emailLabel: 'ORGANIZATION EMAIL',
    placeholder: 'Enter company email (e.g. ops@harborbell.com)',
    defaultEmail: 'ops@harborbell.com',
    icon: '🏢'
  },
  'supervisor': {
    badge: 'SITE SUPERVISOR',
    title: 'Supervisor',
    desc: 'Routes to warehouse site passcode picker (Mohali, Chandigarh, Patiala).',
    emailLabel: 'SUPERVISOR / COMPANY EMAIL',
    placeholder: 'Enter authorized email (e.g. ops@harborbell.com)',
    defaultEmail: 'ops@harborbell.com',
    icon: '👷'
  },
  'platform-admin': {
    badge: 'PLATFORM ADMIN',
    title: 'Platform Admin',
    desc: 'Routes to platform administration console (approvals & metrics).',
    emailLabel: 'ADMIN EMAIL',
    placeholder: 'admin@optivault.internal',
    defaultEmail: 'admin@optivault.internal',
    icon: '🛡️'
  }
};

export default function SignInPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  usePageStylesheet('/css/sigin.css');
  const [role, setRole] = useState(() => {
    const fromUrl = searchParams.get('role');
    if (fromUrl && ROLE_INFO[fromUrl]) return fromUrl;
    return localStorage.getItem('optivault-role') || 'company-admin';
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [animatedPcts, setAnimatedPcts] = useState({});
  const googleBtnRef = useRef(null);

  // Initialize Google Identity Services
  useEffect(() => {
    if (role === 'platform-admin') return;

    let isMounted = true;
    const clientId = window.__GOOGLE_CLIENT_ID__ || '304461158169-1ibf3i818r8a40hlrbtf1iub6b8tf8la.apps.googleusercontent.com';

    const renderGoogleBtn = () => {
      if (!isMounted || !googleBtnRef.current || !window.google?.accounts?.id) return;
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (!response?.credential) {
              setError('Google authentication was cancelled.');
              return;
            }
            setLoading(true);
            const result = await loginWithGoogle(response.credential, role);
            setLoading(false);
            if (result.ok) {
              const dest = ROLE_DESTINATIONS[role] || '/company-dashboard';
              navigate(dest);
            } else {
              setError(result.message || 'Google sign-in was declined.');
            }
          },
          auto_select: false
        });

        googleBtnRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          type: 'standard',
          shape: 'rectangular',
          theme: 'outline',
          text: 'signin_with',
          size: 'large',
          logo_alignment: 'left',
          width: 320
        });
      } catch (err) {
        console.warn('Google Auth Render Error:', err);
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
  }, [role]);

  useEffect(() => {
    const urlRole = searchParams.get('role');
    if (urlRole && ROLE_INFO[urlRole]) {
      setRole(urlRole);
    }
  }, [searchParams]);

  // Animate sample occupancy cards on mount
  useEffect(() => {
    const timeouts = SAMPLE_SLOTS.map((slot, index) => {
      return setTimeout(() => {
        setAnimatedPcts(prev => ({ ...prev, [slot.id]: slot.target }));
      }, index * 100 + 200);
    });

    return () => timeouts.forEach(t => clearTimeout(t));
  }, []);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError('');
    localStorage.setItem('optivault-role', newRole);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please provide your organization email.');
      return;
    }
    if (!password) {
      setError('Please enter your workspace password.');
      return;
    }

    setLoading(true);
    const result = await loginUser(email.trim(), password, role);
    setLoading(false);

    if (result.ok) {
      const dest = ROLE_DESTINATIONS[role] || '/company-dashboard';
      navigate(dest);
    } else {
      setError(result.message || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleDemoFill = () => {
    const info = ROLE_INFO[role];
    setEmail(info.defaultEmail);
    setPassword(role === 'platform-admin' ? 'optivault2026' : 'warehouse123');
    setError('');
  };

  const currentRoleInfo = ROLE_INFO[role] || ROLE_INFO['company-admin'];

  return (
    <div className="signin-page-root">
      <div className="page-grid" aria-hidden="true"></div>

      <header className="signin-header">
        <Link to="/" className="logo">
          OPTI<span>VAULT</span>
        </Link>
        <div className="header-status">
          <span className="status-item">
            <span className="dot"></span> SYSTEM READY
          </span>
          <span className="sep">·</span>
          <span className="status-item">AWAITING ACCESS</span>
          <span className="sep">·</span>
          <Link to="/" className="back-link">
            BACK TO SITE
          </Link>
        </div>
      </header>

      <main className="signin-main">
        <div className="signin-inner">
          {/* LEFT: Pitch & live zone panel */}
          <section className="pitch reveal">
            <h1>
              Your warehouse.<br />
              Your inventory.<br />
              One <span className="accent">optimized</span> system.
            </h1>
            <p className="sub">
              Sign in to manage your company's warehouses, inventory and storage optimization from a single allocation engine.
            </p>

            <div className="zone-panel">
              <div className="zone-row">
                <span className="zone-label">
                  ZONE A <span className="dash">—</span> UTILIZATION
                </span>
                <span className="zone-label occ">
                  OCCUPANCY <strong>72%</strong>
                </span>
              </div>

              <div className="slot-cards">
                {SAMPLE_SLOTS.map(slot => {
                  const pct = animatedPcts[slot.id] || 0;
                  return (
                    <div className="scard" key={slot.id} data-target={slot.target}>
                      <div className="scard-label">{slot.id}</div>
                      <div className="scard-pct">{pct}%</div>
                      <div className="scard-bar">
                        <i style={{ width: `${pct}%`, transition: 'width 0.8s ease' }}></i>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="zone-foot">
                <span>48 PALLET POSITIONS</span>
                <span>AVG PICK PATH <strong>61 M</strong></span>
              </div>
            </div>
          </section>

          {/* RIGHT: Sign-in Card */}
          <section className="auth-card reveal">
            <div className="eyebrow">COMPANY ACCESS</div>
            <h2>Sign in to OptiVault</h2>
            <p className="sub">Use the organization email registered to your workspace.</p>

            {/* Role Switcher */}
            <div className="role-switcher-card">
              <div className="role-switcher-head">
                <span className="rsw-title">ACCESS PORTAL ROLE</span>
                <span className="rsw-badge">{currentRoleInfo.badge}</span>
              </div>
              <div className="role-pills" role="tablist">
                {Object.keys(ROLE_INFO).map(rKey => {
                  const item = ROLE_INFO[rKey];
                  return (
                    <button
                      key={rKey}
                      type="button"
                      className={`role-pill ${role === rKey ? 'active' : ''}`}
                      onClick={() => handleRoleChange(rKey)}
                      title={item.desc}
                    >
                      <span className="rp-ico">{item.icon}</span>
                      <span>{item.title}</span>
                    </button>
                  );
                })}
              </div>
              <div className="role-dest-hint">
                <span className="hint-bullet">●</span> <span>{currentRoleInfo.desc}</span>
              </div>
            </div>

            {error && (
              <div className="form-error show" role="alert" style={{ display: 'block', marginBottom: 16 }}>
                {error}
              </div>
            )}

            {/* Google Sign-In Option */}
            {role !== 'platform-admin' && (
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
                        setError('Google Sign-In service is initializing. Please verify your connection.');
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
                    <span>Sign in with Google</span>
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
                  <span style={{ padding: '0 10px' }}>OR WITH EMAIL &amp; PASSWORD</span>
                  <span style={{ flex: 1, borderBottom: '1px solid #e2ddd5' }}></span>
                </div>
              </div>
            )}

            <form id="signinForm" onSubmit={handleSubmit} noValidate>
              <label className="field-label" htmlFor="orgEmail">
                {currentRoleInfo.emailLabel}
              </label>
              <input
                type="email"
                id="orgEmail"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={currentRoleInfo.placeholder}
                autoComplete="username"
                required
              />

              <label className="field-label" htmlFor="orgPassword">
                PASSWORD
              </label>
              <div className="pw-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="orgPassword"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="pw-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M2.5 2.5l15 15M8.3 8.4a2.6 2.6 0 0 0 3.4 3.4M5.6 5.7C3.4 7 1 10 1 10s3.5 6 9 6c1.4 0 2.7-.4 3.8-1M12.3 4.3C11.6 4.1 10.8 4 10 4c-5.5 0-9 6-9 6" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M1 10s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
                      <circle cx="10" cy="10" r="2.6" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="field-hint">ENTER YOUR WORKSPACE PASSWORD</div>

              <div className="form-row">
                <label className="remember">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                  />
                  <span>Remember this device</span>
                </label>
                <button
                  type="button"
                  onClick={handleDemoFill}
                  className="forgot-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  AUTO-FILL DEMO CREDENTIALS
                </button>
              </div>

              <button type="submit" className="enter-btn" disabled={loading}>
                <span className="btn-text">
                  {loading ? 'VERIFYING CREDENTIALS…' : 'ENTER WORKSPACE'}
                </span>
                <span className="btn-arrow">→</span>
              </button>

              <div className="form-row form-row-bottom">
                <span className="sub small">No workspace yet?</span>
                <Link to="/signup" className="register-link">
                  REGISTER COMPANY
                </Link>
              </div>
            </form>

            <div className="secure-note">
              <span className="mark"></span> SECURE ORGANIZATIONAL ACCESS
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
