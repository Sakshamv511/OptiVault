import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/styles.css';

const GRID_LAYOUT = [
  2, 1, 0, 2, 1, 0, 1, 0, 2, 1, 1, 0,
  1, 0, 2, 1, 0, 2, 1, 1, 0, 1, 0, 2,
  0, 1, 2, 1, 1, 0, 2, 1, 0, 1, 0, 0,
  2, 1, 0, 0, 2, 1, 0, 1, 0, 2, 1, 0
];

const SLOT_CLASSES = ['', 'g', 'o'];

export default function LandingPage() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('slotwise-theme') || 'light';
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState('role'); // 'role' or 'company'
  const [hiddenBoxes, setHiddenBoxes] = useState([]);
  const [showMessage, setShowMessage] = useState(false);

  // Apply Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('slotwise-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // 48-slot sequential intro animation
  useEffect(() => {
    const startDelay = 700;
    const blockDelay = 65;
    const totalBlocks = GRID_LAYOUT.length;

    const timer = setTimeout(() => {
      GRID_LAYOUT.forEach((_, idx) => {
        setTimeout(() => {
          setHiddenBoxes(prev => [...prev, idx]);
        }, idx * blockDelay);
      });

      const lastBlockTime = (totalBlocks - 1) * blockDelay;
      setTimeout(() => {
        setShowMessage(true);
      }, lastBlockTime + 600);
    }, startDelay);

    return () => clearTimeout(timer);
  }, []);

  const handleRoleSelect = (role) => {
    localStorage.setItem('optivault-role', role);
    setModalOpen(false);
    navigate(`/signin?role=${role}`);
  };

  return (
    <div className="landing-page">
      {/* NAV */}
      <header className="site-nav">
        <div className="wrap d-flex align-items-center justify-content-between">
          <Link to="/" className="brand mono">
            OPTI<span>VAULT</span>
          </Link>

          <nav className="nav-links mono d-none d-md-flex align-items-center">
            <a href="#system">SYSTEM</a>
            <a href="#impact">IMPACT</a>
            <a href="#start">START</a>
            <button
              type="button"
              className="btn-account"
              onClick={() => {
                setModalStep('role');
                setModalOpen(true);
              }}
            >
              ACCOUNT
            </button>

            <button
              className="theme-toggle mono"
              onClick={toggleTheme}
              type="button"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              <span className="theme-icon" aria-hidden="true">
                {theme === 'dark' ? '☀' : '◐'}
              </span>
              <span className="theme-label">
                {theme === 'dark' ? 'LIGHT' : 'DARK'}
              </span>
            </button>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="hero wrap">
        <div className="row g-5 align-items-start">
          <div className="col-lg-6">
            <span className="tag mono">WAREHOUSE OPTIMIZATION ENGINE</span>

            <h1 className="serif hero-title">
              Every item has a <em className="hl">correct</em> place. Every box, a <em className="hl">tight</em> fit.
            </h1>

            <p className="lead-copy">
              OptiVault decides where inventory should sit and how orders should be packed — cutting travel time, wasted space, and shipping cost in one engine.
            </p>

            <div className="d-flex flex-wrap gap-3 mt-4">
              <Link to="/signup" className="btn-primary mono">
                REQUEST ACCESS
              </Link>
              <a href="#system" className="btn-ghost mono">
                SEE HOW IT WORKS
              </a>
            </div>

            <div className="row mt-5 hero-meta mono">
              <div className="col-6">
                <span className="muted">DEPLOYMENT</span>
                <p>Zone-level pilot</p>
              </div>
              <div className="col-6">
                <span className="muted">INTEGRATION</span>
                <p>Sits beside your WMS</p>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="blueprint">
              <div className="d-flex justify-content-between mono bp-head">
                <span>FIG. 01 — UNIT LOAD / PACK ENVELOPE</span>
                <span className="hl">SCALE 1:20</span>
              </div>

              <div className="bp-body">
                <svg className="bp-svg" viewBox="0 0 340 260" fill="none">
                  <path d="M95 95 L150 55 L285 55 L230 95 Z" stroke="var(--svg-line)" stroke-width="1.6" />
                  <path d="M230 95 L285 55 L285 175 L230 215 Z" stroke="var(--svg-line)" stroke-width="1.6" />
                  <rect x="95" y="95" width="135" height="120" stroke="var(--svg-line)" stroke-width="1.6" />
                  <g stroke="var(--svg-grid)" stroke-width="1">
                    <rect x="95" y="95" width="45" height="40" fill="var(--orange)" />
                    <rect x="140" y="95" width="45" height="40" fill="var(--green)" />
                    <rect x="185" y="95" width="45" height="40" fill="var(--svg-white)" />
                    <rect x="95" y="135" width="45" height="40" fill="var(--svg-white)" />
                    <rect x="140" y="135" width="45" height="40" fill="var(--svg-white)" />
                    <rect x="185" y="135" width="45" height="40" fill="var(--orange)" />
                    <rect x="95" y="175" width="45" height="40" fill="var(--green)" />
                    <rect x="140" y="175" width="45" height="40" fill="var(--orange)" />
                    <rect x="185" y="175" width="45" height="40" fill="var(--svg-white)" />
                  </g>
                  <line x1="95" y1="232" x2="230" y2="232" stroke="var(--svg-muted)" />
                  <line x1="95" y1="227" x2="95" y2="237" stroke="var(--svg-muted)" />
                  <line x1="230" y1="227" x2="230" y2="237" stroke="var(--svg-muted)" />
                  <text x="162" y="250" fill="var(--svg-muted)" font-family="monospace" font-size="11" text-anchor="middle">
                    1200 MM
                  </text>
                  <line x1="303" y1="55" x2="303" y2="175" stroke="var(--svg-muted)" />
                  <line x1="298" y1="55" x2="308" y2="55" stroke="var(--svg-muted)" />
                  <line x1="298" y1="175" x2="308" y2="175" stroke="var(--svg-muted)" />
                  <text x="312" y="132" fill="var(--svg-muted)" font-family="monospace" font-size="11">
                    800
                  </text>
                  <line x1="230" y1="42" x2="285" y2="42" stroke="var(--svg-muted)" />
                  <line x1="230" y1="37" x2="230" y2="47" stroke="var(--svg-muted)" />
                  <line x1="285" y1="37" x2="285" y2="47" stroke="var(--svg-muted)" />
                  <text x="238" y="34" fill="var(--svg-muted)" font-family="monospace" font-size="11">
                    DEPTH
                  </text>
                  <line x1="285" y1="55" x2="322" y2="34" stroke="var(--orange)" stroke-dasharray="4 3" />
                  <line x1="285" y1="115" x2="322" y2="115" stroke="var(--orange)" stroke-dasharray="4 3" />
                  <circle cx="322" cy="34" r="3" fill="var(--orange)" />
                  <text x="286" y="26" fill="var(--orange)" font-family="monospace" font-size="11">
                    FIT 94%
                  </text>
                </svg>

                <span className="bp-note mono">SLOT A-07 / HIGH VELOCITY</span>
              </div>

              <div className="d-flex justify-content-between mono bp-foot muted">
                <span>REV. 04</span>
                <span>OptiVault / PACKING OPTIMIZER</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section id="system" className="wrap">
        <div className="dashboard">
          <div className={`optivault-message ${showMessage ? 'show' : ''}`} id="optivaultMessage">
            <span className="welcome-text">Welcome to</span>
            <span className="welcome-brand">OptiVault</span>
          </div>

          <div className="row g-4">
            <div className="col-lg-8">
              <span className="mono muted small">LIVE SLOT MAP — ZONE A</span>
              <div className="d-flex justify-content-between align-items-baseline">
                <h3 className="serif dash-title">48 slots under active allocation</h3>
                <span className="mono muted small">UPDATED 12S AGO</span>
              </div>

              <div className="slot-grid mono" id="slotGrid">
                {GRID_LAYOUT.map((val, idx) => {
                  const isHidden = hiddenBoxes.includes(idx);
                  const colorClass = SLOT_CLASSES[val] || '';
                  return (
                    <span
                      key={idx}
                      className={`${colorClass} ${isHidden ? 'box-hide' : ''}`}
                    />
                  );
                })}
              </div>
            </div>

            <div className="col-lg-4 status-col">
              <span className="mono muted small">STATUS</span>
              <ul className="legend mono">
                <li>
                  <i className="sw o"></i> High-velocity (near dock)
                </li>
                <li>
                  <i className="sw g"></i> Allocated
                </li>
                <li>
                  <i className="sw a"></i> Available
                </li>
              </ul>
              <hr />
              <div className="d-flex justify-content-between align-items-baseline">
                <span className="mono muted small">OCCUPANCY</span>
                <span className="serif hl big-num">72%</span>
              </div>
              <div className="bar">
                <div className="bar-fill" style={{ width: '72%' }}></div>
              </div>
              <div className="stat-row mono">
                <span className="muted">SLOTS FREE</span>
                <b>13</b>
              </div>
              <div className="stat-row mono">
                <span className="muted">AVG PICK PATH</span>
                <b>38 m</b>
              </div>
              <p className="live mono">
                <span className="dot"></span> LIVE SYSTEM
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* IMPACT ROW */}
      <section id="impact" className="wrap impact-row">
        <div className="row">
          <div className="col-6 col-md-3 impact-cell">
            <span className="serif hl big-num">+31%</span>
            <p className="mono muted small">SPACE UTILIZATION</p>
          </div>
          <div className="col-6 col-md-3 impact-cell">
            <span className="serif hl big-num">-24%</span>
            <p className="mono muted small">PICK TRAVEL TIME</p>
          </div>
          <div className="col-6 col-md-3 impact-cell">
            <span className="serif hl big-num">-18%</span>
            <p className="mono muted small">SHIPPING COST / ORDER</p>
          </div>
          <div className="col-6 col-md-3 impact-cell">
            <span className="serif hl big-num">99.9%</span>
            <p className="mono muted small">ALLOCATION ACCURACY</p>
          </div>
        </div>
      </section>

      {/* ENGINES */}
      <section className="wrap engines">
        <h2 className="serif section-title">
          Two engines. One warehouse. <span className="rule"></span>
        </h2>
        <p className="lead-copy sub">
          Allocation and packing share one model of your inventory, so a decision made at receiving still holds at the pack bench.
        </p>
        <hr className="thick" />

        <div className="engine-item row">
          <div className="col-md-2">
            <span className="mono hl small">01 / SLOT ALLOCATION</span>
          </div>
          <div className="col-md-7">
            <h4 className="serif">Placement Engine</h4>
            <p className="lead-copy">
              Assigns incoming inventory to the best-fit warehouse slot using dimensions, capacity and movement priority.
            </p>
          </div>
          <div className="col-md-3 diag">
            <div className="d-inline-flex align-items-center gap-2">
              <span className="box-line">
                <i></i><i></i>
              </span>
              <span className="arrow mono">- - &gt;</span>
              <span className="mini-grid">
                <span className="o"></span>
                <span></span>
                <span></span>
                <span className="g"></span>
              </span>
            </div>
          </div>
        </div>

        <div className="engine-item row">
          <div className="col-md-2">
            <span className="mono hl small">02 / PACKING OPTIMIZER</span>
          </div>
          <div className="col-md-7">
            <h4 className="serif">3D Bin Packing</h4>
            <p className="lead-copy">
              Finds efficient box arrangements to reduce unused volume while respecting item dimensions and constraints.
            </p>
          </div>
          <div className="col-md-3 diag">
            <svg width="120" height="70" viewBox="0 0 120 70" fill="none" stroke="var(--svg-line)" strokeWidth="1.3">
              <rect x="8" y="38" width="20" height="14" fill="var(--orange)" stroke="none" />
              <rect x="28" y="38" width="20" height="14" fill="var(--green)" stroke="none" />
              <rect x="28" y="24" width="20" height="14" fill="var(--green)" stroke="none" />
              <rect x="8" y="24" width="60" height="28" />
              <path d="M8 24 L26 10 L86 10 L68 24 Z" />
              <path d="M68 24 L86 10 L86 38 L68 52 Z" />
              <text x="94" y="16" fill="var(--orange)" stroke="none" fontFamily="monospace" fontSize="8">
                94%
              </text>
            </svg>
          </div>
        </div>

        <div className="engine-item row">
          <div className="col-md-2">
            <span className="mono hl small">03 / INVENTORY SYNC</span>
          </div>
          <div className="col-md-7">
            <h4 className="serif">Real-Time Stock</h4>
            <p className="lead-copy">
              Keeps slot occupancy and inventory movements aligned so warehouse teams always work from current data.
            </p>
          </div>
          <div className="col-md-3 diag">
            <svg viewBox="0 0 120 40" className="spark">
              <polyline points="0,30 25,32 45,20 70,26 95,10 120,6" fill="none" stroke="var(--svg-line)" strokeWidth="2" />
              <circle cx="95" cy="10" r="3" fill="var(--orange)" />
            </svg>
          </div>
        </div>

        <div className="engine-item row">
          <div className="col-md-2">
            <span className="mono hl small">04 / INTEGRATION</span>
          </div>
          <div className="col-md-7">
            <h4 className="serif">Works With Your WMS</h4>
            <p className="lead-copy">
              Designed to connect allocation, packing, orders and inventory through a clean service-based architecture.
            </p>
          </div>
          <div className="col-md-3 diag">
            <div className="d-inline-flex align-items-center gap-2">
              <span className="box-line">
                <i></i><i></i>
              </span>
              <span className="node mono">
                -&lt;<i className="dot-o"></i>&gt;-
              </span>
              <span className="box-line">
                <i></i>
              </span>
            </div>
          </div>
        </div>

        <hr className="thick" />
      </section>

      {/* HOW IT WORKS */}
      <section id="start" className="wrap how">
        <span className="mono muted small">HOW IT WORKS</span>
        <div className="row g-4 mt-1">
          <div className="col-md-4">
            <div className="step-card">
              <span className="mono hl small">STEP 01</span>
              <h4 className="serif">Ingest dimensions</h4>
              <p className="lead-copy">
                Item size, weight, order velocity and slot capacity are read from your existing records.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="step-card">
              <span className="mono hl small">STEP 02</span>
              <h4 className="serif">Allocate slot</h4>
              <p className="lead-copy">
                Fast movers land near the dock, bulk goes deep, and every slot keeps a valid fit.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="step-card">
              <span className="mono hl small">STEP 03</span>
              <h4 className="serif">Optimize pack</h4>
              <p className="lead-copy">
                Pack benches receive a carton choice and a load order that removes wasted volume.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* INTEGRATIONS */}
      <section className="wrap">
        <div className="integrations mono">
          <div className="row text-center int-names">
            <div className="col">SAP EWM</div>
            <div className="col">ORACLE WMS</div>
            <div className="col">MANHATTAN</div>
            <div className="col">NETSUITE</div>
            <div className="col">SHOPIFY</div>
          </div>
          <hr />
          <p className="int-note muted">
            OPTIVAULT SITS ALONGSIDE EXISTING SYSTEMS — IT ADVISES PLACEMENT AND PACKING. YOUR WMS STAYS THE RECORD OF TRUTH.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="row footer-top">
            <div className="col-md-5">
              <Link to="/" className="brand mono">
                OPTI<span>VAULT</span>
              </Link>
              <p className="mono muted small mt-2">
                WAREHOUSE SLOT ALLOCATION &amp; PACKING OPTIMIZER
              </p>
            </div>
            <div className="col-4 col-md-2 mono foot-col">
              <span className="muted small">PRODUCT</span>
              <a href="#system">Placement Engine</a>
              <a href="#system">Bin Packing</a>
              <a href="#system">Inventory Sync</a>
            </div>
            <div className="col-4 col-md-2 mono foot-col">
              <span className="muted small">COMPANY</span>
              <a href="#system">About</a>
              <a href="#system">Careers</a>
              <a href="#system">Contact</a>
            </div>
            <div className="col-4 col-md-2 mono foot-col">
              <span className="muted small">ACCESS</span>
              <Link to="/signin">Sign In</Link>
              <Link to="/signup">Register</Link>
              <Link to="/platform-admin">Console</Link>
            </div>
          </div>
          <div className="d-flex justify-content-between mono muted small footer-bottom">
            <span>OPTIVAULT SYSTEMS</span>
            <span>© 2026</span>
          </div>
        </div>
      </footer>

      {/* ACCESS MODAL */}
      {modalOpen && (
        <div className="am-root" role="dialog" aria-modal="true">
          <div className="am-panel" tabIndex="-1">
            <div className="am-head">
              <div>
                <div className="am-eyebrow">
                  <i className="am-tick"></i> Access
                </div>
                <h2 className="am-title">How are you signing in?</h2>
                <p className="am-sub">
                  Pick the account you hold. This only decides which sign-in form you get next.
                </p>
              </div>
              <button
                className="am-close"
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <div className="am-viewport">
              {modalStep === 'role' ? (
                <div className="am-step">
                  <div className="am-options">
                    <button
                      className="am-option"
                      type="button"
                      onClick={() => setModalStep('company')}
                    >
                      <span>
                        <span className="am-opt-tag">Organization</span>
                        <span className="am-opt-name">Company</span>
                        <span className="am-opt-desc">
                          You work for a company whose warehouses run on OptiVault.
                        </span>
                      </span>
                      <span className="am-arrow" aria-hidden="true">&rarr;</span>
                    </button>

                    <button
                      className="am-option"
                      type="button"
                      onClick={() => handleRoleSelect('platform-admin')}
                    >
                      <span>
                        <span className="am-opt-tag">Internal</span>
                        <span className="am-opt-name">Platform admin</span>
                        <span className="am-opt-desc">
                          OptiVault staff overseeing every client company and approving new warehouses.
                        </span>
                      </span>
                      <span className="am-arrow" aria-hidden="true">&rarr;</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="am-step">
                  <div className="am-trail">
                    <button
                      className="am-back"
                      type="button"
                      onClick={() => setModalStep('role')}
                    >
                      &larr; Back
                    </button>
                    <span className="am-trail-sep">/</span>
                    <span>Company</span>
                  </div>

                  <div className="am-options">
                    <button
                      className="am-option"
                      type="button"
                      onClick={() => handleRoleSelect('company-admin')}
                    >
                      <span>
                        <span className="am-opt-tag">Oversight</span>
                        <span className="am-opt-name">Company admin</span>
                        <span className="am-opt-desc">
                          See every warehouse in your organization. View only — no stock changes.
                        </span>
                      </span>
                      <span className="am-arrow" aria-hidden="true">&rarr;</span>
                    </button>

                    <button
                      className="am-option"
                      type="button"
                      onClick={() => handleRoleSelect('supervisor')}
                    >
                      <span>
                        <span className="am-opt-tag">Warehouse floor</span>
                        <span className="am-opt-name">Supervisor</span>
                        <span className="am-opt-desc">
                          Pick the warehouse you're assigned to. Each one needs its own passcode.
                        </span>
                      </span>
                      <span className="am-arrow" aria-hidden="true">&rarr;</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="am-foot">
              <span>One sign-in per organization</span>
              <span>
                No account? <Link to="/signup" onClick={() => setModalOpen(false)}>Register your company</Link>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
