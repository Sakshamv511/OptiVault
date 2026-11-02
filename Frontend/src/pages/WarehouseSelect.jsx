import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSession, logout } from '../services/authService';
import {
  warehousesForCompany,
  syncWarehousesForCompany,
  loadWarehouse,
  warehouseStats,
  initialsOf,
  FLOOR_KEYS
} from '../services/floorEngine';
import { usePageStylesheet } from '../hooks/usePageStylesheet';

export default function WarehouseSelect() {
  const navigate = useNavigate();
  usePageStylesheet('/css/floor.css');
  const session = getSession();
  const companyName = session?.company || 'Demo company';
  const isDemo = !session;

  const [chosenSite, setChosenSite] = useState(null);
  const [passcode, setPasscode] = useState('');
  const [passError, setPassError] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    syncWarehousesForCompany(companyName).then(() => setRefreshKey(k => k + 1));

    const handleStorage = (e) => {
      if (!e.key || e.key.includes('optivault')) {
        setRefreshKey(k => k + 1);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [companyName]);

  const sites = useMemo(() => {
    const raw = warehousesForCompany(companyName);
    return raw.map(site => {
      const wh = loadWarehouse(site.id);
      const st = warehouseStats(wh);
      const state = st.capacityUsed >= 85 ? 'high' : st.capacityUsed >= 40 ? 'mid' : 'low';
      return { ...site, warehouse: wh, stats: st, state };
    });
  }, [companyName, refreshKey]);

  const handleOpenModal = (site) => {
    setChosenSite(site);
    setPasscode('');
    setPassError('');
  };

  const handlePasscodeSubmit = (e) => {
    e.preventDefault();
    if (!chosenSite) return;

    if (!passcode.trim()) {
      setPassError('Enter the passcode for this warehouse.');
      return;
    }

    if (passcode.trim() !== chosenSite.passcode) {
      setPassError('That passcode does not match this warehouse.');
      return;
    }

    setUnlocking(true);
    localStorage.setItem(FLOOR_KEYS.active, chosenSite.id);
    localStorage.setItem(FLOOR_KEYS.unlocked, chosenSite.id);
    try {
      sessionStorage.removeItem('optivault-admin-view');
    } catch (err) {}

    setTimeout(() => {
      navigate('/warehouse-floor');
    }, 350);
  };

  const handleSignOut = () => {
    logout();
    navigate('/signin');
  };

  return (
    <div className="select-page-root">
      <header>
        <div className="logo">
          <div className="sq">O</div>
          <div>
            <b>{companyName}</b>
            <span>SUPERVISOR ACCESS · SELECT A SITE</span>
          </div>
        </div>

        <div className="hright">
          <span className="live">
            ● {sites.length} SITE{sites.length === 1 ? '' : 'S'} ONLINE
          </span>
          <span className="avatar" onClick={handleSignOut} title="Sign out">
            {initialsOf(companyName)}
          </span>
        </div>
      </header>

      {isDemo && (
        <div className="demo-banner">
          Not signed in — showing the site list in demo mode.
          <Link to="/signin" style={{ marginLeft: 6 }}>
            Sign in as a supervisor
          </Link> to work against your own session.
        </div>
      )}

      <main>
        <div className="hdr-row">
          <div>
            <h1>Choose your warehouse</h1>
            <div className="sub">
              Your company account opens this list. Each site needs its own passcode before the floor unlocks.
            </div>
          </div>
        </div>

        {sites.length === 0 ? (
          <div
            className="empty-state"
            style={{
              textAlign: 'center',
              padding: '60px 24px',
              background: '#fff',
              border: '1px dashed #d5cec5',
              borderRadius: 8
            }}
          >
            <h3 style={{ fontSize: 18, marginBottom: 8 }}>No warehouses assigned yet</h3>
            <p style={{ color: '#666', fontSize: 14 }}>
              Your company administrator has not opened any warehouses yet. Once an addition request is approved by the platform administration team, it will appear here.
            </p>
          </div>
        ) : (
          <div className="site-grid">
            {sites.map(site => (
              <button
                key={site.id}
                className="site"
                type="button"
                onClick={() => handleOpenModal(site)}
              >
                <div className="site-top">
                  <div>
                    <div className="site-city">{site.city}</div>
                    <div className="site-name">{site.name}</div>
                  </div>
                  <span className="site-code">{site.id}</span>
                </div>

                <div className="site-note">{site.note || `${site.city} logistics depot`}</div>

                <div className="site-meter">
                  <div className="site-meter-row">
                    <span>CAPACITY USED</span>
                    <b>{site.stats.capacityUsed}%</b>
                  </div>
                  <div className="site-bar">
                    <i className={site.state} style={{ width: `${site.stats.capacityUsed}%` }}></i>
                  </div>
                </div>

                <div className="site-facts">
                  <span>{site.warehouse.racks?.length || 0} racks</span>
                  <span>{site.stats.totalSlots} slots</span>
                  <span>{site.stats.emptySlots} empty</span>
                </div>

                <div className="site-foot">
                  <span className="lock">🔒 Passcode required</span>
                  <span className="go">Enter →</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* PASSCODE MODAL */}
      {chosenSite && (
        <div className="modal on">
          <div className="modal-panel pass-panel">
            <div className="modal-head">
              <div>
                <h3>{chosenSite.name}</h3>
                <div className="m-sub">{chosenSite.city} · {chosenSite.id}</div>
              </div>
              <button
                className="btn"
                type="button"
                onClick={() => setChosenSite(null)}
              >
                Cancel
              </button>
            </div>

            <div className="modal-body">
              <p className="pass-intro">
                Enter the passcode issued for this site to open its floor.
                {isDemo && (
                  <span style={{ display: 'block', fontSize: 11, color: '#0284c7', marginTop: 4 }}>
                    Demo code: <strong>{chosenSite.passcode}</strong>
                  </span>
                )}
              </p>

              {passError && (
                <div className="pass-error" style={{ display: 'block', marginBottom: 12 }}>
                  {passError}
                </div>
              )}

              <form onSubmit={handlePasscodeSubmit} noValidate>
                <div className="field">WAREHOUSE PASSCODE</div>
                <input
                  className="pass-input"
                  type="text"
                  inputMode="numeric"
                  value={passcode}
                  onChange={e => setPasscode(e.target.value)}
                  placeholder="••••"
                  autoFocus
                  required
                />

                <button
                  className="btn dark"
                  type="submit"
                  disabled={unlocking}
                  style={{ width: '100%', marginTop: 12 }}
                >
                  {unlocking ? 'OPENING FLOOR…' : 'UNLOCK FLOOR'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
