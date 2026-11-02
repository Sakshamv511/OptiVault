import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSession, logout } from '../services/authService';
import {
  warehousesForCompany,
  syncWarehousesForCompany,
  loadWarehouse,
  warehouseStats,
  requestsForCompany,
  submitWarehouseRequest,
  submitDeleteRequest,
  initialsOf,
  timeAgo,
  mergeApprovedSites
} from '../services/floorEngine';
import { getApiUrl } from '../services/apiConfig';
import '../css/admin.css';

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const session = getSession();
  const companyName = session?.company || 'Demo company';
  const isDemo = !session;

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'requests'
  const [siteFilter, setSiteFilter] = useState('all'); // 'all' | 'busy' | 'roomy'
  const [searchQuery, setSearchQuery] = useState('');
  const [reqFilter, setReqFilter] = useState('open'); // 'open' | 'delete'

  // Modals
  const [reqModalOpen, setReqModalOpen] = useState(false);
  const [reqSentRef, setReqSentRef] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pendingDeleteSite, setPendingDeleteSite] = useState(null);

  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameWhId, setRenameWhId] = useState('');
  const [renameName, setRenameName] = useState('');
  const [renameCity, setRenameCity] = useState('');
  const [renameError, setRenameError] = useState('');

  // Requisition Form Fields
  const [reqCity, setReqCity] = useState('');
  const [reqAddress, setReqAddress] = useState('');
  const [reqSlots, setReqSlots] = useState(32);
  const [reqContact, setReqContact] = useState('');
  const [reqNote, setReqNote] = useState('');
  const [reqError, setReqError] = useState('');

  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = useCallback(() => {
    mergeApprovedSites();
    setRefreshKey(k => k + 1);
  }, []);

  // Sync from cloud and load on mount + focus / storage
  useEffect(() => {
    syncWarehousesForCompany(companyName).then(() => triggerRefresh());

    const handleStorage = (e) => {
      if (!e.key || e.key.includes('optivault')) {
        triggerRefresh();
      }
    };
    const handleFocus = () => {
      syncWarehousesForCompany(companyName).then(() => triggerRefresh());
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
    };
  }, [companyName, triggerRefresh]);

  // Collect Sites & Stats
  const { sites, stats, requests } = useMemo(() => {
    const rawSites = warehousesForCompany(companyName);
    const companySites = rawSites.map(info => {
      const wh = loadWarehouse(info.id);
      const st = warehouseStats(wh);
      const lastLog = wh.log && wh.log.length > 0 ? timeAgo(wh.log[0].at) : 'recently';
      return { info, warehouse: wh, stats: st, lastLog };
    });

    const compRequests = requestsForCompany(companyName);
    const waitingReqs = compRequests.filter(r => r.status === 'pending');

    const totalSlots = companySites.reduce((acc, s) => acc + s.stats.totalSlots, 0);
    const totalLitres = companySites.reduce((acc, s) => acc + s.stats.totalLitres, 0);
    const usedLitres = companySites.reduce((acc, s) => acc + s.stats.usedLitres, 0);
    const waitingUnits = companySites.reduce((acc, s) => acc + s.stats.pending, 0);
    const avgUtil = totalLitres ? Math.round((usedLitres / totalLitres) * 100) : 0;

    return {
      sites: companySites,
      stats: {
        siteCount: companySites.length,
        reqCount: waitingReqs.length,
        avgUtil,
        totalSlots,
        waitingUnits
      },
      requests: compRequests
    };
  }, [companyName, refreshKey]);

  // Filtered Sites
  const filteredSites = useMemo(() => {
    return sites.filter(s => {
      if (siteFilter === 'busy' && s.stats.capacityUsed < 65) return false;
      if (siteFilter === 'roomy' && s.stats.capacityUsed >= 40) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesName = (s.info.name || '').toLowerCase().includes(q);
        const matchesCity = (s.info.city || '').toLowerCase().includes(q);
        const matchesId = (s.info.id || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCity && !matchesId) return false;
      }
      return true;
    });
  }, [sites, siteFilter, searchQuery]);

  // Filtered Requests
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      if (reqFilter === 'delete') return r.type === 'delete';
      return r.type !== 'delete';
    });
  }, [requests, reqFilter]);

  const handleSignOut = () => {
    logout();
    navigate('/signin');
  };

  const handleOpenProvision = () => {
    setReqCity('');
    setReqAddress('');
    setReqSlots(32);
    setReqContact('');
    setReqNote('');
    setReqError('');
    setReqSentRef('');
    setReqModalOpen(true);
  };

  const handleRequisitionSubmit = (e) => {
    e.preventDefault();
    setReqError('');

    if (!reqCity.trim() || !reqAddress.trim() || !reqContact.trim() || !reqSlots) {
      setReqError('Please complete city, address, slot requirement, and site lead.');
      return;
    }
    if (Number(reqSlots) < 8) {
      setReqError('Minimum facility capacity is 8 slots.');
      return;
    }

    const req = submitWarehouseRequest({
      company: companyName,
      city: reqCity.trim(),
      address: reqAddress.trim(),
      proposedSlots: Number(reqSlots),
      contact: reqContact.trim(),
      note: reqNote.trim()
    });

    setReqSentRef(req.ref);
    triggerRefresh();
  };

  const handleOpenDecommission = (site) => {
    setPendingDeleteSite(site);
    setDeleteModalOpen(true);
  };

  const handleConfirmDecommission = () => {
    if (!pendingDeleteSite) return;
    submitDeleteRequest({
      company: companyName,
      warehouseId: pendingDeleteSite.info.id,
      city: pendingDeleteSite.info.city
    });
    setDeleteModalOpen(false);
    setPendingDeleteSite(null);
    triggerRefresh();
  };

  const handleOpenRename = (site) => {
    setRenameWhId(site.info.id);
    setRenameName(site.info.name || '');
    setRenameCity(site.info.city || '');
    setRenameError('');
    setRenameModalOpen(true);
  };

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    setRenameError('');

    if (!renameName.trim() || !renameCity.trim()) {
      setRenameError('Both facility name and regional hub city are required.');
      return;
    }

    try {
      const url = getApiUrl('/api/warehouse/rename');
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          warehouseId: renameWhId,
          newName: renameName.trim(),
          newCity: renameCity.trim()
        })
      });
    } catch (e) {}

    // Update in memory/local
    const approved = JSON.parse(localStorage.getItem('optivault-approved-warehouses') || '[]');
    const match = approved.find(w => w.id === renameWhId);
    if (match) {
      match.name = renameName.trim();
      match.city = renameCity.trim();
      localStorage.setItem('optivault-approved-warehouses', JSON.stringify(approved));
    }

    setRenameModalOpen(false);
    triggerRefresh();
  };

  return (
    <div className="b2b-app-root">
      <div className="page-grid" aria-hidden="true"></div>

      {/* TOP B2B APP BAR */}
      <header className="b2b-header">
        <div className="header-inner">
          <div className="brand-block">
            <Link to="/" className="b2b-brand">
              <span className="brand-square">OV</span>
              <span className="brand-name">
                OPTI<span>VAULT</span>
              </span>
              <span className="brand-divider">/</span>
              <span className="brand-sub">ENTERPRISE LEDGER</span>
            </Link>
            <div className="sys-badge">
              <span className="live-dot"></span>
              <span>TELEMETRY LIVE</span>
            </div>
          </div>

          <nav className="b2b-nav" role="tablist">
            <button
              className={`b2b-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
              type="button"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              <span>FACILITY OVERSIGHT</span>
            </button>
            <button
              className={`b2b-nav-item ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
              type="button"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <span>PROVISIONING QUEUE</span>
              {stats.reqCount > 0 && <span className="count">{stats.reqCount}</span>}
            </button>
          </nav>

          <div className="b2b-user-area">
            <div className="org-meta">
              <span className="org-label">ORGANIZATION</span>
              <strong className="org-name">{companyName}</strong>
            </div>
            <div className="user-pill">
              <div className="user-avatar">{initialsOf(companyName)}</div>
              <div className="user-details">
                <span className="user-role-label">COMPANY ADMIN</span>
                <span className="user-status-text">Authorized Portal</span>
              </div>
            </div>
            <button
              type="button"
              className="b2b-signout-btn"
              onClick={handleSignOut}
              title="Sign out of enterprise ledger"
            >
              <span>EXIT</span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Demo Banner */}
      {isDemo && (
        <div className="demo-banner">
          <div className="demo-banner-content">
            <span className="demo-tag">DEMO PREVIEW</span>
            <span>Viewing corporate ledger in unauthenticated demo session.</span>
            <Link to="/signin">Sign in with Organization Credentials →</Link>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="ledger-main">
        {activeTab === 'overview' ? (
          <section className="view on">
            {/* Titlebar */}
            <div className="ledger-titlebar">
              <div className="title-left">
                <div className="section-tag">
                  <span className="tag-code">LEDGER-01</span>
                  <span>MULTI-FACILITY OPERATIONS</span>
                </div>
                <h1>Warehouse Oversight</h1>
                <p className="ledger-desc">
                  {sites.length} warehouses on record. Stock is placed and removed on site by supervisors; this ledger is view-only.
                </p>
              </div>
              <div className="title-right">
                <button
                  className="b2b-btn b2b-btn-primary"
                  type="button"
                  onClick={handleOpenProvision}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>Provision New Warehouse</span>
                </button>
              </div>
            </div>

            {/* KPI Matrix */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-head">
                  <span className="kpi-label">ACTIVE SITES</span>
                  <span className="kpi-badge neutral">OPERATIONAL</span>
                </div>
                <div className="kpi-metric"><b>{stats.siteCount}</b></div>
                <div className="kpi-foot">
                  <span className="kpi-sub">Facilities under management</span>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-head">
                  <span className="kpi-label">PROVISIONING QUEUE</span>
                  <span className="kpi-badge amber">IN REVIEW</span>
                </div>
                <div className="kpi-metric"><b>{stats.reqCount}</b></div>
                <div className="kpi-foot">
                  <span className="kpi-sub">Awaiting platform approval</span>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-head">
                  <span className="kpi-label">AVG UTILIZATION</span>
                  <span className="kpi-badge terracotta">VOLUMETRIC</span>
                </div>
                <div className="kpi-metric"><b>{stats.avgUtil}%</b></div>
                <div className="kpi-foot">
                  <span className="kpi-sub">Average fleet occupancy</span>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-head">
                  <span className="kpi-label">TOTAL CAPACITY</span>
                  <span className="kpi-badge neutral">SLOTS</span>
                </div>
                <div className="kpi-metric"><b>{stats.totalSlots.toLocaleString()}</b></div>
                <div className="kpi-foot">
                  <span className="kpi-sub">Total managed slot positions</span>
                </div>
              </div>

              <div className={`kpi-card ${stats.waitingUnits > 0 ? 'warn' : ''}`}>
                <div className="kpi-head">
                  <span className="kpi-label">STAGING QUEUE</span>
                  <span className="kpi-badge warn">DOCK PENDING</span>
                </div>
                <div className="kpi-metric"><b>{stats.waitingUnits}</b></div>
                <div className="kpi-foot">
                  <span className="kpi-sub">Pallets awaiting rack slot</span>
                </div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="b2b-toolbar">
              <div className="toolbar-search">
                <svg className="search-ico" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter by facility name, region, or warehouse code (e.g. WH-01)…"
                />
              </div>

              <div className="toolbar-filters">
                <span className="filter-label">FILTER:</span>
                <div className="filter-group">
                  <button
                    className={`filter-pill ${siteFilter === 'all' ? 'on' : ''}`}
                    onClick={() => setSiteFilter('all')}
                    type="button"
                  >
                    ALL SITES
                  </button>
                  <button
                    className={`filter-pill ${siteFilter === 'busy' ? 'on' : ''}`}
                    onClick={() => setSiteFilter('busy')}
                    type="button"
                  >
                    OVER 65% FULL
                  </button>
                  <button
                    className={`filter-pill ${siteFilter === 'roomy' ? 'on' : ''}`}
                    onClick={() => setSiteFilter('roomy')}
                    type="button"
                  >
                    UNDER 40% FULL
                  </button>
                </div>
              </div>

              <div className="toolbar-telemetry">
                <span className="telemetry-dot"></span>
                <span>Figures synchronized live from floor activity</span>
              </div>
            </div>

            {/* Facility Cards Grid */}
            <div className="facilities-grid">
              {filteredSites.length === 0 ? (
                <div className="empty-state" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', background: '#fff', border: '1px dashed #dcd5cc', borderRadius: 8 }}>
                  <h4>No warehouses match this filter</h4>
                  <p style={{ color: '#64748b', fontSize: 13, marginTop: 6 }}>
                    Submit a requisition to provision warehouse storage capacity with the platform team.
                  </p>
                  <button
                    className="b2b-btn b2b-btn-primary"
                    type="button"
                    onClick={handleOpenProvision}
                    style={{ marginTop: 14 }}
                  >
                    Provision New Warehouse
                  </button>
                </div>
              ) : (
                filteredSites.map(site => {
                  const usedPct = site.stats.capacityUsed;
                  const barClass = usedPct >= 85 ? 'full' : usedPct >= 65 ? 'busy' : '';

                  return (
                    <div className="facility-card" key={site.info.id}>
                      <div className="fcard-head">
                        <div>
                          <div className="fcard-city">{site.info.city}</div>
                          <div className="fcard-name">{site.info.name}</div>
                        </div>
                        <span className="fcard-code">{site.info.id}</span>
                      </div>

                      <div className="fcard-body">
                        <div className="fcard-note">
                          {site.info.note || 'Active warehouse ledger'} · Last activity: <strong>{site.lastLog}</strong>.
                        </div>

                        <div className="fcard-meter">
                          <div className="fcard-meter-row">
                            <span>OCCUPANCY RATE</span>
                            <span className="pct">{usedPct}%</span>
                          </div>
                          <div className="fcard-bar">
                            <i className={barClass} style={{ width: `${usedPct}%` }}></i>
                          </div>
                        </div>

                        <div className="fcard-facts">
                          <div>
                            <span>RACKS</span>
                            <b>{site.warehouse.racks?.length || 0}</b>
                          </div>
                          <div>
                            <span>TOTAL SLOTS</span>
                            <b>{site.stats.totalSlots}</b>
                          </div>
                          <div>
                            <span>EMPTY SLOTS</span>
                            <b>{site.stats.emptySlots}</b>
                          </div>
                          <div>
                            <span>WAITING</span>
                            <b>{site.stats.pending}</b>
                          </div>
                        </div>
                      </div>

                      <div className="fcard-foot">
                        <Link
                          to={`/warehouse-floor?id=${site.info.id}&view=admin`}
                          className="b2b-btn b2b-btn-secondary"
                        >
                          <span>Inspect Floor</span>
                          <span>↗</span>
                        </Link>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            type="button"
                            className="b2b-btn b2b-btn-ghost"
                            onClick={() => handleOpenRename(site)}
                            title="Rename warehouse"
                          >
                            Rename
                          </button>
                          <button
                            type="button"
                            className="b2b-btn b2b-btn-ghost text-danger"
                            onClick={() => handleOpenDecommission(site)}
                            title="Decommission warehouse"
                          >
                            Decommission
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        ) : (
          <section className="view on">
            {/* Provisioning Queue View */}
            <div className="ledger-titlebar">
              <div className="title-left">
                <div className="section-tag">
                  <span className="tag-code">QUEUE-02</span>
                  <span>CAPACITY REQUISITIONS PIPELINE</span>
                </div>
                <h1>Provisioning Queue</h1>
                <p className="ledger-desc">
                  Facility additions and decommissioning requests require platform engineering clearance before warehouse slot maps and supervisor credentials go live.
                </p>
              </div>
              <div className="title-right">
                <button
                  className="b2b-btn b2b-btn-primary"
                  type="button"
                  onClick={handleOpenProvision}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>Provision New Warehouse</span>
                </button>
              </div>
            </div>

            <div className="req-toolbar">
              <div className="filter-group">
                <button
                  className={`filter-pill ${reqFilter === 'open' ? 'on' : ''}`}
                  onClick={() => setReqFilter('open')}
                  type="button"
                >
                  <span>FACILITY ADDITIONS</span>
                </button>
                <button
                  className={`filter-pill ${reqFilter === 'delete' ? 'on' : ''}`}
                  onClick={() => setReqFilter('delete')}
                  type="button"
                >
                  <span>DECOMMISSIONING REQUESTS</span>
                </button>
              </div>
            </div>

            <div className="req-container">
              {filteredRequests.length === 0 ? (
                <div className="empty-state" style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', border: '1px dashed #dcd5cc', borderRadius: 8 }}>
                  <h4>No {reqFilter === 'delete' ? 'decommissioning' : 'facility addition'} requests</h4>
                  <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
                    Submit a capacity proposal using the Provision New Warehouse button above.
                  </p>
                </div>
              ) : (
                <table className="req-table">
                  <thead>
                    <tr>
                      <th>Tracking Reference</th>
                      <th>{reqFilter === 'delete' ? 'Warehouse Decommission' : 'Proposed Location'}</th>
                      {reqFilter !== 'delete' && <th>Slots Planned</th>}
                      <th>Submitted</th>
                      <th>Review Decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map(entry => (
                      <tr key={entry.ref}>
                        <td>
                          <span className="ref">{entry.ref}</span>
                        </td>
                        <td>
                          {entry.type === 'delete' ? (
                            <>
                              <div className="city">{entry.city}</div>
                              <div className="sub-line">{entry.warehouseId}</div>
                            </>
                          ) : (
                            <>
                              <div className="city">{entry.city}</div>
                              <div className="sub-line">{entry.address}</div>
                            </>
                          )}
                        </td>
                        {reqFilter !== 'delete' && (
                          <td>
                            <strong>{entry.proposedSlots}</strong> slots
                          </td>
                        )}
                        <td>{timeAgo(entry.submittedAt)}</td>
                        <td>
                          <span className={`status ${entry.status}`}>
                            {entry.status.toUpperCase()}
                          </span>
                          {entry.status === 'approved' && entry.type === 'delete' && (
                            <div className="sub-line">Decommission finalized</div>
                          )}
                          {entry.status === 'approved' && entry.type !== 'delete' && entry.warehouseId && (
                            <div className="sub-line">
                              Operational as <strong>{entry.warehouseId}</strong> (Passcode: <code>{entry.passcode}</code>)
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer className="b2b-footer">
        <div className="footer-inner">
          <div className="foot-col">
            <div className="foot-brand">
              OPTI<span>VAULT</span> ENTERPRISE WMS
            </div>
            <div className="foot-meta">AUDITED VOLUMETRIC ALLOCATION ENGINE · ENTERPRISE OPERATIONS LEDGER</div>
          </div>
          <div className="foot-col foot-right">
            <span>STOCK PLACEMENTS AND DISPATCHES ARE PROCESSED ON-SITE BY CERTIFIED SUPERVISORS.</span>
            <span className="view-only-tag">LEDGER ACCESS: STRICTLY READ-ONLY</span>
          </div>
        </div>
      </footer>

      {/* PROVISION WAREHOUSE MODAL */}
      {reqModalOpen && (
        <div className="b2b-modal on">
          <div className="b2b-modal-dialog">
            <div className="modal-header">
              <div>
                <div className="dialog-tag">REQUISITION FORM · RFC-2026</div>
                <h3>Submit Warehouse Requisition</h3>
                <p className="dialog-sub">
                  Transmitted to the OptiVault Platform team. Facility rack models and supervisor passcodes will be provisioned upon clearance.
                </p>
              </div>
              <button
                className="dialog-close"
                type="button"
                onClick={() => setReqModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-content">
              {reqSentRef ? (
                <div className="sent-panel">
                  <div className="sent-badge">✓</div>
                  <h4>Requisition Successfully Transmitted</h4>
                  <p>
                    The platform administration queue has received your warehouse proposal. Track verification progress under the Provisioning Queue.
                  </p>
                  <div className="tracking-chip">
                    <span>REQUISITION REFERENCE:</span>
                    <b>{reqSentRef}</b>
                  </div>
                  <button
                    className="b2b-btn b2b-btn-secondary btn-block"
                    type="button"
                    onClick={() => setReqModalOpen(false)}
                  >
                    CLOSE WINDOW
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRequisitionSubmit} noValidate>
                  {reqError && (
                    <div className="form-error show" style={{ display: 'block', marginBottom: 12 }}>
                      {reqError}
                    </div>
                  )}

                  <div className="form-row">
                    <label className="field-title" htmlFor="reqCity">
                      PRIMARY CITY / HUB LOCATION
                    </label>
                    <input
                      id="reqCity"
                      className="b2b-input"
                      type="text"
                      value={reqCity}
                      onChange={e => setReqCity(e.target.value)}
                      placeholder="e.g. Ludhiana Logistics Center"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <label className="field-title" htmlFor="reqAddress">
                      FACILITY POSTAL ADDRESS / INDUSTRIAL ZONE
                    </label>
                    <input
                      id="reqAddress"
                      className="b2b-input"
                      type="text"
                      value={reqAddress}
                      onChange={e => setReqAddress(e.target.value)}
                      placeholder="e.g. Focal Point Phase 5, NH-44 Corridor"
                      required
                    />
                  </div>

                  <div className="form-duo">
                    <div>
                      <label className="field-title" htmlFor="reqSlots">
                        TARGET SLOTS REQUIRED
                      </label>
                      <input
                        id="reqSlots"
                        className="b2b-input"
                        type="number"
                        min="8"
                        value={reqSlots}
                        onChange={e => setReqSlots(e.target.value)}
                        placeholder="e.g. 32"
                        required
                      />
                    </div>
                    <div>
                      <label className="field-title" htmlFor="reqContact">
                        AUTHORIZING SITE MANAGER
                      </label>
                      <input
                        id="reqContact"
                        className="b2b-input"
                        type="text"
                        value={reqContact}
                        onChange={e => setReqContact(e.target.value)}
                        placeholder="Full name of site lead"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <label className="field-title" htmlFor="reqNote">
                      LOGISTICS PROFILE &amp; CATEGORY SPECIFICATIONS (OPTIONAL)
                    </label>
                    <textarea
                      id="reqNote"
                      className="b2b-textarea"
                      value={reqNote}
                      onChange={e => setReqNote(e.target.value)}
                      placeholder="Storage categories, pallet throughput velocity, fragile handling, cold storage, or overhang requirements…"
                    />
                  </div>

                  <button className="b2b-btn b2b-btn-primary btn-block" type="submit">
                    <span>SUBMIT CAPACITY REQUISITION</span>
                    <span>→</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DECOMMISSION MODAL */}
      {deleteModalOpen && pendingDeleteSite && (
        <div className="b2b-modal on">
          <div className="b2b-modal-dialog dialog-compact">
            <div className="modal-header">
              <div>
                <div className="dialog-tag tag-danger">DECOMMISSIONING REQUISITION</div>
                <h3>Request Site Removal</h3>
                <p className="dialog-sub">
                  Transmitted to platform administration. The facility remains accessible until final review.
                </p>
              </div>
              <button
                className="dialog-close"
                type="button"
                onClick={() => setDeleteModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-content">
              <div className="decommission-warning">
                <span className="warn-symbol">⚠️</span>
                <div>
                  Confirm submitting a decommissioning proposal for <strong>{pendingDeleteSite.info.name}</strong> ({pendingDeleteSite.info.id})?
                </div>
              </div>
              <div className="dialog-btn-row">
                <button
                  className="b2b-btn b2b-btn-secondary"
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  style={{ flex: 1 }}
                >
                  CANCEL
                </button>
                <button
                  className="b2b-btn b2b-btn-danger"
                  type="button"
                  onClick={handleConfirmDecommission}
                  style={{ flex: 1.4 }}
                >
                  TRANSMIT REMOVAL REQUEST
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENAME MODAL */}
      {renameModalOpen && (
        <div className="b2b-modal on">
          <div className="b2b-modal-dialog dialog-mid">
            <div className="modal-header">
              <div>
                <div className="dialog-tag">FACILITY DIRECTORY UPDATE</div>
                <h3>Update Facility Nomenclature</h3>
                <p className="dialog-sub">Modify the official display title and regional hub label across the corporate ledger.</p>
              </div>
              <button
                className="dialog-close"
                type="button"
                onClick={() => setRenameModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-content">
              <form onSubmit={handleRenameSubmit}>
                <div className="form-row">
                  <label className="field-title">REGISTERED FACILITY CODE</label>
                  <input className="b2b-input input-readonly" type="text" value={renameWhId} readOnly />
                </div>
                <div className="form-row">
                  <label className="field-title">OFFICIAL FACILITY TITLE</label>
                  <input
                    className="b2b-input"
                    type="text"
                    value={renameName}
                    onChange={e => setRenameName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-row">
                  <label className="field-title">REGIONAL HUB / CITY DESIGNATION</label>
                  <input
                    className="b2b-input"
                    type="text"
                    value={renameCity}
                    onChange={e => setRenameCity(e.target.value)}
                    required
                  />
                </div>

                {renameError && (
                  <div className="form-error show" style={{ display: 'block', marginBottom: 12 }}>
                    {renameError}
                  </div>
                )}

                <div className="dialog-btn-row">
                  <button
                    className="b2b-btn b2b-btn-secondary"
                    type="button"
                    onClick={() => setRenameModalOpen(false)}
                    style={{ flex: 1 }}
                  >
                    CANCEL
                  </button>
                  <button
                    className="b2b-btn b2b-btn-primary"
                    type="submit"
                    style={{ flex: 1.2 }}
                  >
                    SAVE SPECIFICATION
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
