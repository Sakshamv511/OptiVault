import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { loginUser, ROLE_DESTINATIONS } from '../services/authService';
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

            <form onSubmit={handleSubmit} noValidate>
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
