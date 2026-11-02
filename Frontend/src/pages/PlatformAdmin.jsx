import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSession, logout } from '../services/authService';
import {
  loadRequests,
  saveRequests,
  approveWarehouseRequest,
  rejectWarehouseRequest,
  approveDeleteRequest,
  rejectDeleteRequest,
  deleteWarehouseRequest,
  loadWarehouse,
  warehouseStats,
  timeAgo,
  WAREHOUSE_DIRECTORY
} from '../services/floorEngine';
import { getApiUrl } from '../services/apiConfig';
import '../css/platform.css';

export default function PlatformAdmin() {
  const navigate = useNavigate();
  const session = getSession();
  const isPlatformAdmin = session?.role === 'platform-admin';

  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'companies' | 'sites'
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [requestsList, setRequestsList] = useState(() => loadRequests());

  const fetchCompanies = useCallback(async () => {
    setLoadingCompanies(true);
    try {
      const url = getApiUrl('/api/admin/companies');
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.success && Array.isArray(data.companies)) {
        setCompanies(data.companies);
      }
    } catch (e) {
      console.warn('Could not fetch companies from backend:', e);
    } finally {
      setLoadingCompanies(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const refreshRequests = () => {
    setRequestsList(loadRequests());
  };

  // Company decisions
  const handleCompanyDecision = async (email, decision) => {
    try {
      const url = getApiUrl('/api/admin/companies/decide');
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, decision })
      });
      fetchCompanies();
    } catch (e) {
      alert('Action could not be executed.');
    }
  };

  const handleCompanyDelete = async (identifier, name) => {
    if (!window.confirm(`Are you sure you want to delete company "${name}"? This cannot be undone.`)) {
      return;
    }
    try {
      const url = getApiUrl(`/api/admin/companies/${encodeURIComponent(identifier)}`);
      await fetch(url, { method: 'DELETE' });
      fetchCompanies();
    } catch (e) {
      alert('Delete could not be completed.');
    }
  };

  // Warehouse Request decisions
  const handleApproveReq = (ref, isDelete) => {
    if (isDelete) {
      approveDeleteRequest(ref);
    } else {
      approveWarehouseRequest(ref);
    }
    refreshRequests();
  };

  const handleRejectReq = (ref, isDelete) => {
    if (isDelete) {
      rejectDeleteRequest(ref);
    } else {
      rejectWarehouseRequest(ref);
    }
    refreshRequests();
  };

  const handleDeleteReq = (ref, title) => {
    if (!window.confirm(`Are you sure you want to delete warehouse requisition "${title}"?`)) {
      return;
    }
    deleteWarehouseRequest(ref);
    refreshRequests();
  };

  // Computed statistics
  const stats = useMemo(() => {
    const pendingCompanies = companies.filter(c => c.status === 'pending').length;
    const pendingRequests = requestsList.filter(r => r.status === 'pending').length;

    // All registered sites
    const allSites = [...WAREHOUSE_DIRECTORY];
    const totalSlots = allSites.reduce((acc, s) => {
      const wh = loadWarehouse(s.id);
      const st = warehouseStats(wh);
      return acc + st.totalSlots;
    }, 0);

    return {
      totalCompanies: companies.length,
      pendingCompanies,
      pendingRequests,
      totalSites: allSites.length,
      totalSlots
    };
  }, [companies, requestsList]);

  const handleSignOut = () => {
    logout();
    navigate('/signin');
  };

  return (
    <div className="platform-admin-root">
      <header>
        <div className="brand">
          <div className="sq">O</div>
          <div>
            <b>OptiVault Console</b>
            <span>INTERNAL · PLATFORM ADMIN</span>
          </div>
        </div>

        <nav>
          <button
            className={activeTab === 'requests' ? 'active' : ''}
            onClick={() => setActiveTab('requests')}
            type="button"
          >
            WAREHOUSE REQUESTS
            {stats.pendingRequests > 0 && <span className="count">{stats.pendingRequests}</span>}
          </button>
          <button
            className={activeTab === 'companies' ? 'active' : ''}
            onClick={() => setActiveTab('companies')}
            type="button"
          >
            COMPANIES
            {stats.pendingCompanies > 0 && <span className="count">{stats.pendingCompanies}</span>}
          </button>
          <button
            className={activeTab === 'sites' ? 'active' : ''}
            onClick={() => setActiveTab('sites')}
            type="button"
          >
            ALL SITES
          </button>
        </nav>

        <button className="sign-out" type="button" onClick={handleSignOut}>
          <span>{session?.email || 'Platform Admin'}</span> · SIGN OUT
        </button>
      </header>

      {!isPlatformAdmin && (
        <div className="demo-banner">
          Not signed in as platform admin — viewing console in demonstration mode.
          <Link to="/signin?role=platform-admin" style={{ marginLeft: 6 }}>
            Sign in
          </Link> with admin credentials.
        </div>
      )}

      <main>
        {/* Metric Cards */}
        <div className="stats">
          <div className="stat">
            <div className="l">CLIENT COMPANIES</div>
            <b>{stats.totalCompanies}</b>
            <small>{stats.pendingCompanies} pending approval</small>
          </div>
          <div className="stat">
            <div className="l">OPEN REQUESTS</div>
            <b>{stats.pendingRequests}</b>
            <small>awaiting clearance</small>
          </div>
          <div className="stat">
            <div className="l">WAREHOUSES LIVE</div>
            <b>{stats.totalSites}</b>
            <small>active across platform</small>
          </div>
          <div className="stat">
            <div className="l">TOTAL SLOTS</div>
            <b>{stats.totalSlots.toLocaleString()}</b>
            <small>managed capacity</small>
          </div>
        </div>

        {/* ================= TAB 1: WAREHOUSE REQUESTS ================= */}
        {activeTab === 'requests' && (
          <section className="view on">
            <h1>Warehouse Requests</h1>
            <p className="lead">
              Filed by client company administrators. Approving builds real slot maps, auto-provisions credentials, and enables immediate supervisor entry.
            </p>

            <div style={{ marginTop: 22 }}>
              <div className="section-title">Queue</div>
              <div className="queue">
                {requestsList.length === 0 ? (
                  <div className="empty">
                    <b>No warehouse requests</b>
                    When a company admin submits one from their ledger, it lands here for approval.
                  </div>
                ) : (
                  requestsList.map(entry => {
                    const isDelete = entry.type === 'delete';
                    return (
                      <div className={`item ${entry.status !== 'pending' ? 'decided' : ''}`} key={entry.ref}>
                        <div className="item-top">
                          <div>
                            <h3>{isDelete ? `Remove ${entry.city}` : entry.city}</h3>
                            <div className="meta">{isDelete ? entry.warehouseId : entry.address}</div>
                            <div className="ref">{entry.ref} · filed by {entry.company}</div>
                          </div>
                          <span className={`chip ${entry.status}`}>
                            {entry.status.toUpperCase()}
                          </span>
                        </div>

                        {isDelete ? (
                          <div className="facts">
                            <div>Warehouse<b>{entry.warehouseId}</b></div>
                            <div>City<b>{entry.city}</b></div>
                            <div>Filed<b>{timeAgo(entry.submittedAt)}</b></div>
                          </div>
                        ) : (
                          <div className="facts">
                            <div>Slots requested<b>{entry.proposedSlots}</b></div>
                            <div>Racks planned<b>{Math.max(2, Math.min(8, Math.round((entry.proposedSlots || 32) / 8)))}</b></div>
                            <div>Contact<b>{entry.contact}</b></div>
                            <div>Filed<b>{timeAgo(entry.submittedAt)}</b></div>
                          </div>
                        )}

                        {entry.note && <div className="item-note">“{entry.note}”</div>}

                        {entry.status === 'pending' && (
                          <div className="actions">
                            <button
                              className="btn go"
                              type="button"
                              onClick={() => handleApproveReq(entry.ref, isDelete)}
                            >
                              {isDelete ? 'Approve and remove site' : 'Approve and open site'}
                            </button>
                            <button
                              className="btn no"
                              type="button"
                              onClick={() => handleRejectReq(entry.ref, isDelete)}
                            >
                              Decline
                            </button>
                            <button
                              className="btn danger"
                              type="button"
                              onClick={() => handleDeleteReq(entry.ref, entry.city || entry.ref)}
                            >
                              Delete
                            </button>
                          </div>
                        )}

                        {entry.status === 'approved' && (
                          <div className="outcome">
                            {isDelete
                              ? `Warehouse ${entry.warehouseId} was removed from the platform. Decided ${timeAgo(entry.decidedAt)}.`
                              : `Site opened as ${entry.warehouseId} with passcode ${entry.passcode}. It now appears in the company ledger and supervisor picker.`}
                          </div>
                        )}

                        {entry.status === 'rejected' && (
                          <div className="outcome bad">
                            Declined {timeAgo(entry.decidedAt)}. {isDelete ? 'The warehouse was not removed.' : 'No warehouse was created.'}
                            <div style={{ marginTop: 8 }}>
                              <button
                                className="btn danger"
                                type="button"
                                onClick={() => handleDeleteReq(entry.ref, entry.city || entry.ref)}
                              >
                                Delete request
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        )}

        {/* ================= TAB 2: COMPANIES ================= */}
        {activeTab === 'companies' && (
          <section className="view on">
            <h1>Client Companies</h1>
            <p className="lead">
              Registrations from the signup page. A new account cannot sign in until approved here by the platform team.
            </p>

            <div style={{ marginTop: 22 }}>
              <div className="section-title">Accounts</div>
              <div className="queue">
                {loadingCompanies ? (
                  <div style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>Loading client accounts…</div>
                ) : companies.length === 0 ? (
                  <div className="empty">
                    <b>No company registrations yet.</b>
                  </div>
                ) : (
                  companies.map(c => (
                    <div className={`item ${c.status !== 'pending' ? 'decided' : ''}`} key={c._id || c.email}>
                      <div className="item-top">
                        <div>
                          <h3>{c.name}</h3>
                          <div className="meta">{c.email}</div>
                          <div className="ref">{c.reference || 'Registered Account'} · Contact: {c.contact}</div>
                        </div>
                        <span className={`chip ${c.status}`}>
                          {c.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="facts">
                        <div>Status<b>{c.status}</b></div>
                        <div>Warehouses<b>{c.warehouses?.length || c.requestedWarehouses || 1}</b></div>
                        <div>Contact<b>{c.contact}</b></div>
                      </div>

                      {c.status === 'pending' && (
                        <div className="actions">
                          <button
                            className="btn go"
                            type="button"
                            onClick={() => handleCompanyDecision(c.email, 'approved')}
                          >
                            Approve Account
                          </button>
                          <button
                            className="btn no"
                            type="button"
                            onClick={() => handleCompanyDecision(c.email, 'rejected')}
                          >
                            Decline
                          </button>
                          <button
                            className="btn danger"
                            type="button"
                            onClick={() => handleCompanyDelete(c._id || c.email, c.name)}
                          >
                            Delete
                          </button>
                        </div>
                      )}

                      {c.status === 'approved' && (
                        <div className="outcome">
                          Account is active — this company can sign in and its supervisors can reach their warehouses.
                        </div>
                      )}

                      {c.status === 'rejected' && (
                        <div className="outcome bad">
                          Registration declined. User cannot log in.
                          <div style={{ marginTop: 8 }}>
                            <button
                              className="btn danger"
                              type="button"
                              onClick={() => handleCompanyDelete(c._id || c.email, c.name)}
                            >
                              Delete record
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}

        {/* ================= TAB 3: ALL SITES ================= */}
        {activeTab === 'sites' && (
          <section className="view on">
            <h1>All Registered Sites</h1>
            <p className="lead">
              Every warehouse running on the platform, live from each site's slot map.
            </p>

            <div style={{ marginTop: 22 }}>
              <table className="sites-table" style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', border: '1px solid #d5cec5', borderRadius: 8, overflow: 'hidden' }}>
                <thead>
                  <tr style={{ background: '#f5f0eb', textAlign: 'left', fontSize: 11, color: '#666', borderBottom: '1px solid #d5cec5' }}>
                    <th style={{ padding: '12px 16px' }}>CODE</th>
                    <th style={{ padding: '12px 16px' }}>NAME</th>
                    <th style={{ padding: '12px 16px' }}>CITY</th>
                    <th style={{ padding: '12px 16px' }}>COMPANY</th>
                    <th style={{ padding: '12px 16px' }}>CAPACITY</th>
                    <th style={{ padding: '12px 16px' }}>OCCUPANCY</th>
                  </tr>
                </thead>
                <tbody>
                  {WAREHOUSE_DIRECTORY.map(s => {
                    const wh = loadWarehouse(s.id);
                    const st = warehouseStats(wh);
                    return (
                      <tr key={s.id} style={{ borderBottom: '1px solid #eee', fontSize: 13 }}>
                        <td style={{ padding: '12px 16px', fontWeight: 700, fontFamily: 'monospace' }}>{s.id}</td>
                        <td style={{ padding: '12px 16px' }}>{s.name}</td>
                        <td style={{ padding: '12px 16px' }}>{s.city}</td>
                        <td style={{ padding: '12px 16px' }}>{s.company || 'Harbor & Bell'}</td>
                        <td style={{ padding: '12px 16px' }}>{st.totalSlots} slots ({wh.racks?.length || 0} racks)</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontWeight: 700, color: st.capacityUsed >= 85 ? '#dc2626' : '#0284c7' }}>
                            {st.capacityUsed}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
