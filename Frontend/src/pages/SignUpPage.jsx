import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerCompany } from '../services/authService';
import '../css/sigin.css';

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

            <form onSubmit={handleSubmit} noValidate>
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
                      aria-label="Toggle password"
                    />
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
                      aria-label="Toggle confirm password"
                    />
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
