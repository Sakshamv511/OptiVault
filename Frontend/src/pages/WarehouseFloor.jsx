import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getSession, logout } from '../services/authService';
import {
  activeWarehouseId,
  warehouseInfo,
  loadWarehouse,
  saveWarehouse,
  syncFromCloud,
  warehouseStats,
  allSlots,
  findSlotById,
  slotFill,
  slotWeightFill,
  rackFill,
  usedVolume,
  usedWeight,
  freeVolume,
  freeWeight,
  addStock,
  removeStock,
  transferStock,
  resetWarehouse,
  buildSuggestions,
  initialsOf,
  timeAgo,
  FLOOR_KEYS
} from '../services/floorEngine';
import '../css/floor.css';

export default function WarehouseFloor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const session = getSession();

  const isAdminView = searchParams.get('view') === 'admin' || searchParams.get('role') === 'company-admin';
  const urlWarehouseId = searchParams.get('id');

  const [currentId, setCurrentId] = useState(() => {
    return urlWarehouseId || activeWarehouseId() || 'WH-MOH';
  });

  const [warehouse, setWarehouse] = useState(() => loadWarehouse(currentId));
  const [activePane, setActivePane] = useState('floor'); // 'floor' | 'threed' | 'stock' | 'optimizer' | 'reports'
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'near-full' | 'has-space'
  const [searchTerm, setSearchTerm] = useState('');

  // Stock In Form
  const [inSku, setInSku] = useState('SKU-88213');
  const [inName, setInName] = useState('Pallet wrap rolls');
  const [inL, setInL] = useState(60);
  const [inW, setInW] = useState(40);
  const [inH, setInH] = useState(35);
  const [inWeight, setInWeight] = useState(14);
  const [inQty, setInQty] = useState(2);
  const [inVelocity, setInVelocity] = useState('medium');
  const [inFragile, setInFragile] = useState(false);
  const [lastAllocReport, setLastAllocReport] = useState(null);

  // Stock Out Form
  const [outSlot, setOutSlot] = useState('');
  const [outSku, setOutSku] = useState('');
  const [outQty, setOutQty] = useState(1);
  const [outResult, setOutResult] = useState('');

  // Slot Inspector Modal
  const [inspectSlotId, setInspectSlotId] = useState(null);
  const [transSku, setTransSku] = useState('');
  const [transTarget, setTransTarget] = useState('');
  const [transQty, setTransQty] = useState(1);
  const [transferAlert, setTransferAlert] = useState(null);

  // 3D View Angle State
  const [rot360, setRot360] = useState(328);
  const [elevation, setElevation] = useState(25);
  const [autoRotate, setAutoRotate] = useState(false);

  // Check auth & active site
  useEffect(() => {
    const targetId = urlWarehouseId || activeWarehouseId() || 'WH-MOH';
    setCurrentId(targetId);
    localStorage.setItem(FLOOR_KEYS.active, targetId);

    const loaded = loadWarehouse(targetId);
    setWarehouse(loaded);

    syncFromCloud(targetId).then(cloudData => {
      if (cloudData) setWarehouse(cloudData);
    });
  }, [urlWarehouseId]);

  // Auto rotate timer for 3D
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setRot360(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, [autoRotate]);

  const refreshWarehouse = useCallback(() => {
    const updated = loadWarehouse(currentId);
    setWarehouse({ ...updated });
  }, [currentId]);

  const info = useMemo(() => warehouseInfo(currentId), [currentId]);
  const stats = useMemo(() => warehouseStats(warehouse), [warehouse]);
  const suggestions = useMemo(() => buildSuggestions(warehouse), [warehouse]);

  // Racks filtering
  const visibleRacks = useMemo(() => {
    if (!warehouse || !warehouse.racks) return [];
    return warehouse.racks.filter(rack => {
      const fill = rackFill(rack);
      if (filterMode === 'near-full' && fill < 85) return false;
      if (filterMode === 'has-space' && fill >= 40) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const inRackName = (rack.name || '').toLowerCase().includes(q);
        const inZone = (rack.zone || '').toLowerCase().includes(q);
        const inSlots = (rack.slots || []).some(s =>
          s.id.toLowerCase().includes(q) ||
          (s.units || []).some(u => u.sku.toLowerCase().includes(q) || (u.name || '').toLowerCase().includes(q))
        );
        if (!inRackName && !inZone && !inSlots) return false;
      }
      return true;
    });
  }, [warehouse, filterMode, searchTerm]);

  // Inspector Slot details
  const inspectSlotData = useMemo(() => {
    if (!inspectSlotId) return null;
    return findSlotById(warehouse, inspectSlotId);
  }, [warehouse, inspectSlotId]);

  const handleStockIn = (e) => {
    e.preventDefault();
    if (isAdminView) {
      alert('Stock operations are restricted to on-site supervisors.');
      return;
    }

    const report = addStock(warehouse, {
      sku: inSku.trim().toUpperCase(),
      name: inName.trim(),
      l: Number(inL),
      w: Number(inW),
      h: Number(inH),
      weight: Number(inWeight),
      qty: Number(inQty),
      velocity: inVelocity,
      fragile: inFragile
    });

    setLastAllocReport(report);
    refreshWarehouse();
  };

  const handleStockOut = (e) => {
    e.preventDefault();
    if (isAdminView) {
      alert('Stock operations are restricted to on-site supervisors.');
      return;
    }
    if (!outSlot.trim() || !outSku.trim()) {
      setOutResult('Please enter both slot code and SKU.');
      return;
    }

    const res = removeStock(warehouse, outSlot.trim(), outSku.trim(), Number(outQty));
    if (res.ok) {
      setOutResult(`Successfully picked ${res.removed} × ${res.sku} from ${res.slotId}. Freed ${res.freedVolume} L.`);
      setOutSlot('');
      setOutSku('');
      refreshWarehouse();
    } else {
      setOutResult(res.message);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset this warehouse floor back to opening inventory?')) {
      const resetData = resetWarehouse(currentId);
      setWarehouse({ ...resetData });
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!inspectSlotData || !transSku || !transTarget) return;

    const res = await transferStock(warehouse, inspectSlotData.slot.id, transTarget, transSku, Number(transQty));
    if (res.ok) {
      setTransferAlert({ type: 'good', text: res.message });
      refreshWarehouse();
      setTimeout(() => {
        setTransferAlert(null);
      }, 3000);
    } else {
      setTransferAlert({ type: 'bad', text: res.message });
    }
  };

  const handleQuickPick = () => {
    if (!inspectSlotData || !transSku) return;
    const res = removeStock(warehouse, inspectSlotData.slot.id, transSku, Number(transQty));
    if (res.ok) {
      setTransferAlert({ type: 'good', text: `Picked ${res.removed} × ${res.sku} from slot.` });
      refreshWarehouse();
    } else {
      setTransferAlert({ type: 'bad', text: res.message });
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/signin');
  };

  return (
    <div className="floor-page-root">
      {/* HEADER */}
      <header>
        <div className="logo">
          <div className="sq">O</div>
          <div>
            <b>{info?.name || currentId}</b>
            <span>{info?.city || 'Warehouse'} · {info?.id || currentId}</span>
          </div>
        </div>

        <input
          id="floorSearch"
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="🔍 Search slot code, SKU, rack or zone…"
          aria-label="Search the floor"
        />

        <div className="hright">
          {isAdminView && (
            <span className="admin-badge" style={{ background: '#78350f', color: '#fef3c7', padding: '4px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
              🔒 ADMIN VIEW (READ ONLY)
            </span>
          )}
          <span className="live">● LIVE</span>
          <Link
            to="/warehouse-3d"
            className="btn ghost tiny"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
            title="Open 3D Spatial View"
          >
            🧊 3D View ↗
          </Link>
          <button
            className="btn ghost tiny"
            onClick={() => navigate(isAdminView ? '/company-dashboard' : '/warehouse-select')}
            title="Back to site selector"
          >
            ⇄ Change site
          </button>
          {!isAdminView && (
            <button className="btn ghost tiny" onClick={handleReset} title="Reset warehouse">
              ↺ Reset
            </button>
          )}
          <span className="avatar" onClick={handleSignOut} title="Sign out">
            {initialsOf(session?.company || 'Demo')}
          </span>
        </div>
      </header>

      {/* SUB-NAVBAR */}
      <nav className="mainnav">
        <div className="nav-inner">
          <button
            className={`navlink ${activePane === 'floor' ? 'on' : ''}`}
            onClick={() => setActivePane('floor')}
            type="button"
          >
            <span className="nav-ico">▦</span> FLOOR
            {stats.pending > 0 && <span className="nav-badge">{stats.pending}</span>}
          </button>
          <button
            className={`navlink ${activePane === 'threed' ? 'on' : ''}`}
            onClick={() => setActivePane('threed')}
            type="button"
          >
            <span className="nav-ico">🧊</span> 3D VIEW
          </button>
          <button
            className={`navlink ${activePane === 'stock' ? 'on' : ''}`}
            onClick={() => setActivePane('stock')}
            type="button"
          >
            <span className="nav-ico">⇅</span> STOCK IN / OUT
          </button>
          <button
            className={`navlink ${activePane === 'optimizer' ? 'on' : ''}`}
            onClick={() => setActivePane('optimizer')}
            type="button"
          >
            <span className="nav-ico">◈</span> OPTIMIZER
            {suggestions.length > 0 && <span className="nav-badge">{suggestions.length}</span>}
          </button>
          <button
            className={`navlink ${activePane === 'reports' ? 'on' : ''}`}
            onClick={() => setActivePane('reports')}
            type="button"
          >
            <span className="nav-ico">▤</span> REPORTS
          </button>
        </div>
      </nav>

      {/* TOP HEADLINE METRICS */}
      <main>
        <div className="stats">
          <div className="stat">
            <div className="l">CAPACITY USED</div>
            <b>{stats.capacityUsed}%</b>
            <small>{stats.usedLitres.toLocaleString()} / {stats.totalLitres.toLocaleString()} L</small>
          </div>
          <div className="stat">
            <div className="l">EMPTY SLOTS</div>
            <b>{stats.emptySlots}</b>
            <small>of {stats.totalSlots} total positions</small>
          </div>
          <div className="stat">
            <div className="l">WAITING FOR SPACE</div>
            <b>{stats.pending}</b>
            <small>units awaiting allocation</small>
          </div>
          <div className="stat">
            <div className="l">OPTIMIZER FLAGS</div>
            <b>{suggestions.length}</b>
            <small>diagnostic alerts active</small>
          </div>
        </div>

        {/* ================= PANE 1: FLOOR MAP ================= */}
        {activePane === 'floor' && (
          <section className="pane on">
            <div className="pane-head">
              <div>
                <h1>Warehouse Floor</h1>
                <div className="sub">Live spatial occupancy across all storage bays and rack elevations.</div>
              </div>
            </div>

            <div className="tabs">
              <button
                className={`tab ${filterMode === 'all' ? 'on' : ''}`}
                onClick={() => setFilterMode('all')}
              >
                ALL RACKS
              </button>
              <button
                className={`tab ${filterMode === 'near-full' ? 'on' : ''}`}
                onClick={() => setFilterMode('near-full')}
              >
                NEAR-FULL (≥85%)
              </button>
              <button
                className={`tab ${filterMode === 'has-space' ? 'on' : ''}`}
                onClick={() => setFilterMode('has-space')}
              >
                HAS SPACE (&lt;40%)
              </button>
              <div className="legend">
                <span><i style={{ background: 'linear-gradient(90deg, #34d399, #10b981)' }}></i>under 40%</span>
                <span><i style={{ background: 'linear-gradient(90deg, #fbbf24, #f59e0b)' }}></i>40–85%</span>
                <span><i style={{ background: 'linear-gradient(90deg, #f87171, #ef4444)' }}></i>over 85%</span>
              </div>
            </div>

            <div id="racks">
              {visibleRacks.map(rack => {
                const fill = rackFill(rack);
                return (
                  <div className="rack" key={rack.id}>
                    <div className="rack-head">
                      <div>
                        <h3>{rack.name}</h3>
                        <div className="rack-meta">
                          {rack.zone} · Distance from dock: {rack.distanceFromDock} step(s)
                        </div>
                      </div>
                      <div className="rack-meter">
                        <div className="bar">
                          <i style={{ width: `${fill}%` }}></i>
                        </div>
                        <span>{fill}%</span>
                      </div>
                    </div>

                    <div className="rack-slots">
                      {(rack.slots || []).map(slot => {
                        const sFill = slotFill(slot);
                        const stateClass = sFill >= 85 ? 'full' : sFill >= 40 ? 'busy' : 'vacant';
                        const unitsCount = slot.units?.length || 0;
                        const skus = Array.from(new Set((slot.units || []).map(u => u.sku))).join(', ');

                        return (
                          <div
                            key={slot.id}
                            className={`slot ${stateClass}`}
                            onClick={() => {
                              setInspectSlotId(slot.id);
                              setTransferAlert(null);
                            }}
                            title={`Inspect ${slot.id}`}
                          >
                            <div className="slot-top">
                              <span className="slot-id">{slot.id}</span>
                              <span className="slot-pct">{sFill}%</span>
                            </div>
                            <div className="slot-body">
                              {unitsCount > 0 ? (
                                <div className="slot-items">
                                  <strong>{unitsCount} units</strong>
                                  <div className="slot-sku">{skus}</div>
                                </div>
                              ) : (
                                <span className="empty-lbl">Vacant</span>
                              )}
                            </div>
                            <div className="slot-bar">
                              <i style={{ width: `${sFill}%` }}></i>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {warehouse.pending && warehouse.pending.length > 0 && (
              <div className="pending-panel">
                <h4>⚠️ Waiting for space ({warehouse.pending.length} units)</h4>
                <div className="hint">
                  These units did not fit on initial intake. Remove stock to free a slot and the engine automatically re-evaluates them.
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                  {warehouse.pending.map((unit, idx) => (
                    <span key={idx} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '4px 8px', borderRadius: 4, fontSize: 11 }}>
                      {unit.sku} ({unit.volume} L)
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ================= PANE 3D VIEW ================= */}
        {activePane === 'threed' && (
          <section className="pane on">
            <div className="pane-head">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap' }}>
                <div>
                  <h1>3D Spatial View</h1>
                  <div className="sub">Interactive 360° isometric perspective model mapped directly to physical rack elevations.</div>
                </div>
                <Link
                  to="/warehouse-3d"
                  className="btn"
                  style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 6, textDecoration: 'none', fontWeight: 600 }}
                >
                  🧊 Open Standalone 3D Studio ↗
                </Link>
              </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 10, background: '#0c0e12', border: '1px solid #1e293b' }}>
              <div className="stage-controls" style={{ background: '#111827', padding: '12px 18px', display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', borderBottom: '1px solid #1e293b' }}>
                <div className="ctrl-group">
                  <button
                    className={`btn-3d ${autoRotate ? 'active' : ''}`}
                    onClick={() => setAutoRotate(!autoRotate)}
                    type="button"
                  >
                    ⟳ Auto 360°
                  </button>
                  <button className="btn-3d" onClick={() => { setRot360(328); setElevation(25); }} type="button">Isometric</button>
                  <button className="btn-3d" onClick={() => { setRot360(0); setElevation(75); }} type="button">Top</button>
                  <button className="btn-3d" onClick={() => { setRot360(90); setElevation(15); }} type="button">Side</button>
                  <button className="btn-3d" onClick={() => { setRot360(0); setElevation(15); }} type="button">Front</button>
                </div>

                <div className="ctrl-group slider-group" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8' }}>
                  <label>Spin:</label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={rot360}
                    onChange={e => setRot360(Number(e.target.value))}
                  />
                  <span>{rot360}°</span>
                </div>
              </div>

              <div
                style={{
                  minHeight: 460,
                  perspective: 1200,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  background: 'radial-gradient(circle at center, #172033 0%, #0c0e12 75%)',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    transform: `rotateX(${elevation}deg) rotateY(${rot360}deg)`,
                    transformStyle: 'preserve-3d',
                    transition: autoRotate ? 'none' : 'transform 0.15s ease-out',
                    display: 'grid',
                    gridTemplateColumns: `repeat(${warehouse.racks?.length || 4}, 140px)`,
                    gap: 30,
                    padding: 40
                  }}
                >
                  {(warehouse.racks || []).map(r => (
                    <div
                      key={r.id}
                      style={{
                        background: 'rgba(30, 41, 59, 0.7)',
                        border: '1px solid #334155',
                        borderRadius: 8,
                        padding: 10,
                        transformStyle: 'preserve-3d',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)'
                      }}
                    >
                      <div style={{ color: '#38bdf8', fontSize: 11, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>
                        {r.name}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                        {(r.slots || []).map(s => {
                          const fill = slotFill(s);
                          const bg = fill >= 85 ? '#ef4444' : fill >= 40 ? '#f59e0b' : '#10b981';
                          return (
                            <div
                              key={s.id}
                              onClick={() => setInspectSlotId(s.id)}
                              style={{
                                background: bg,
                                color: '#fff',
                                padding: '8px 4px',
                                borderRadius: 4,
                                textAlign: 'center',
                                fontSize: 10,
                                fontWeight: 600,
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                                transition: 'transform 0.2s',
                                userSelect: 'none'
                              }}
                            >
                              <div>{s.id}</div>
                              <div style={{ fontSize: 8, opacity: 0.85 }}>{fill}%</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================= PANE 2: STOCK IN / OUT ================= */}
        {activePane === 'stock' && (
          <section className="pane on">
            <div className="pane-head">
              <div>
                <h1>Stock Management & Allocation</h1>
                <div className="sub">
                  Book inbound putaway or pick removals. Every movement is evaluated server-side via heuristic constraints (dock velocity, volume, weight, fragility).
                </div>
              </div>
            </div>

            <div className="stock-grid">
              {/* Putaway Card */}
              <div className="card">
                <h4>📦 Stock in — Putaway</h4>
                <p className="card-note">The heuristic engine selects the optimal slot based on dock distance velocity and capacity constraints.</p>
                <form onSubmit={handleStockIn} noValidate>
                  <div className="field">SKU IDENTIFIER</div>
                  <input
                    value={inSku}
                    onChange={e => setInSku(e.target.value)}
                    placeholder="e.g. SKU-88213"
                    required
                  />

                  <div className="field">ITEM DESCRIPTION</div>
                  <input
                    value={inName}
                    onChange={e => setInName(e.target.value)}
                    placeholder="e.g. Pallet wrap rolls"
                  />

                  <div className="field">DIMENSIONS L × W × H (CM)</div>
                  <div className="trio">
                    <input
                      type="number"
                      value={inL}
                      onChange={e => setInL(e.target.value)}
                      placeholder="60"
                      min="1"
                    />
                    <input
                      type="number"
                      value={inW}
                      onChange={e => setInW(e.target.value)}
                      placeholder="40"
                      min="1"
                    />
                    <input
                      type="number"
                      value={inH}
                      onChange={e => setInH(e.target.value)}
                      placeholder="35"
                      min="1"
                    />
                  </div>

                  <div className="duo">
                    <div>
                      <div className="field">UNIT WEIGHT (KG)</div>
                      <input
                        type="number"
                        value={inWeight}
                        onChange={e => setInWeight(e.target.value)}
                        placeholder="14"
                        min="1"
                      />
                    </div>
                    <div>
                      <div className="field">BATCH QUANTITY</div>
                      <input
                        type="number"
                        value={inQty}
                        onChange={e => setInQty(e.target.value)}
                        min="1"
                        max="40"
                      />
                    </div>
                  </div>

                  <div className="field">PICK VELOCITY (DOCK PROXIMITY RULE)</div>
                  <select value={inVelocity} onChange={e => setInVelocity(e.target.value)}>
                    <option value="fast">⚡ Fast mover — Pick near dock (Aisles 1–2)</option>
                    <option value="medium">⚖️ Medium mover — Mid floor (Aisles 2–4)</option>
                    <option value="slow">🐢 Slow mover — Store deep (Aisle 5+)</option>
                  </select>

                  <label className="check" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0' }}>
                    <input
                      type="checkbox"
                      checked={inFragile}
                      onChange={e => setInFragile(e.target.checked)}
                    />
                    <span>🛡️ Fragile item — Requires dedicated vacant slot</span>
                  </label>

                  <button type="submit" className="btn dark wide">
                    Allocate slot (DFF Heuristic)
                  </button>
                </form>
              </div>

              {/* Pick / Stock Out Card */}
              <div className="card">
                <h4>📤 Stock out — Pick &amp; Deallocate</h4>
                <p className="card-note">Freeing a slot triggers automatic re-evaluation of any pending queued inbound stock.</p>
                <form onSubmit={handleStockOut} noValidate>
                  <div className="duo">
                    <div>
                      <div className="field">TARGET SLOT ID</div>
                      <input
                        value={outSlot}
                        onChange={e => setOutSlot(e.target.value)}
                        placeholder="e.g. A-01-1"
                        required
                      />
                    </div>
                    <div>
                      <div className="field">PICK QUANTITY</div>
                      <input
                        type="number"
                        value={outQty}
                        onChange={e => setOutQty(e.target.value)}
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="field">SKU IDENTIFIER</div>
                  <input
                    value={outSku}
                    onChange={e => setOutSku(e.target.value)}
                    placeholder="e.g. SKU-88213"
                    required
                  />

                  <button type="submit" className="btn wide">
                    Remove and reallocate queue
                  </button>
                </form>

                {outResult && (
                  <div style={{ marginTop: 14, padding: 10, background: '#f8fafc', borderRadius: 6, fontSize: 12, border: '1px solid #cbd5e1' }}>
                    {outResult}
                  </div>
                )}

                <div className="card-tip">
                  <b>💡 Where do I find a slot code?</b>
                  <span>Open the <b>FLOOR</b> section — every occupied row displays its slot code and the SKUs inside it.</span>
                </div>
              </div>
            </div>

            {/* Heuristic Allocation Report Card */}
            <div className="card report-card" style={{ marginTop: 20 }}>
              {!lastAllocReport ? (
                <div className="alloc-idle">
                  <b>No movement booked yet in this session.</b>
                  <span>Book stock in or out above. The engine will then show every unit it placed, the slot it chose, and the rule that chose it.</span>
                </div>
              ) : (
                <div>
                  <h4 style={{ marginBottom: 12 }}>📋 Heuristic Allocation Decision Audit</h4>
                  {lastAllocReport.placed.map((item, i) => (
                    <div key={i} style={{ padding: 12, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, marginBottom: 8, fontSize: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <strong>{item.unit.name} ({item.unit.sku})</strong>
                        <span style={{ color: '#0284c7', fontWeight: 700 }}>→ Slot {item.slotId}</span>
                      </div>
                      <div style={{ color: '#475569' }}>{item.why.text}</div>
                    </div>
                  ))}
                  {lastAllocReport.rejected.length > 0 && (
                    <div style={{ marginTop: 10, color: '#dc2626', fontSize: 12 }}>
                      ⚠️ {lastAllocReport.rejected.length} units could not be placed due to capacity constraints and were queued.
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ================= PANE 3: OPTIMIZER ================= */}
        {activePane === 'optimizer' && (
          <section className="pane on">
            <div className="pane-head">
              <div>
                <h1>Optimization Engine &amp; Diagnostics</h1>
                <div className="sub">Recalculated dynamically from live slot occupancy. Detects rack pressure, overfill risk, and velocity travel mismatch.</div>
              </div>
            </div>

            <div className="opt-top">
              <div className="opt-count">
                <div className="num-big">{suggestions.length}</div>
                <small>DIAGNOSTIC ADVISORIES</small>
                <div className="opt-break">{suggestions.length === 0 ? 'Optimal' : 'Action Required'}</div>
              </div>
              <div className="opt-checks">
                <h4>Engine Diagnostic Checks</h4>
                <div className="check-row"><b>⚡ Rack Pressure</b><span>Monitors racks over 90% capacity and suggests alternative bays with lower utilization.</span></div>
                <div className="check-row"><b>⚠️ Overfill Risk</b><span>Flags individual slots exceeding 92% volume threshold to avoid physical bottlenecking.</span></div>
                <div className="check-row"><b>⏳ Waiting Queue</b><span>Tracks rejected units awaiting slot availability for automatic putaway.</span></div>
                <div className="check-row"><b>🎯 Pick Velocity</b><span>Identifies high-velocity items stored in deep aisles away from the loading dock.</span></div>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              {suggestions.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: '#16a34a' }}>
                  <h3>✔ All warehouse storage parameters are operating within optimal thresholds.</h3>
                </div>
              ) : (
                suggestions.map((s, idx) => (
                  <div
                    key={idx}
                    className="card"
                    style={{
                      borderLeft: `4px solid ${s.severity === 'high' ? '#ef4444' : '#f59e0b'}`,
                      marginBottom: 10
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: 13 }}>{s.title}</strong>
                      <span className={`chip ${s.severity === 'high' ? 'rejected' : 'pending'}`} style={{ fontSize: 10 }}>
                        {s.type}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* ================= PANE 4: REPORTS ================= */}
        {activePane === 'reports' && (
          <section className="pane on">
            <div className="pane-head">
              <div>
                <h1>Analytics &amp; Zone Reports</h1>
                <div className="sub">Zone-level volumetric utilization across the site and live audit history for this warehouse.</div>
              </div>
            </div>

            <div className="card">
              <h4>📊 Zone Utilization Metrics</h4>
              <p className="card-note">Macro utilization breakdown aggregated across all zones, sorted by distance from loading bay.</p>
              <div>
                {(warehouse.racks || []).map(r => {
                  const fill = rackFill(r);
                  return (
                    <div key={r.id} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span><strong>{r.name}</strong> ({r.zone}) — Dock distance: {r.distanceFromDock}</span>
                        <span>{fill}%</span>
                      </div>
                      <div className="bar" style={{ height: 10 }}>
                        <i style={{ width: `${fill}%` }}></i>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="reports-grid" style={{ marginTop: 20 }}>
              <div className="card">
                <h4>📜 Operational Event Trail</h4>
                <p className="card-note">Audit log of all recent allocations, picks, and replenishment cycles on this floor.</p>
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {(warehouse.log || []).length === 0 ? (
                    <div style={{ color: '#94a3b8', fontSize: 12 }}>No events logged yet.</div>
                  ) : (
                    (warehouse.log || []).map((l, i) => (
                      <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #e2e8f0', fontSize: 11.5, display: 'flex', justifyContent: 'space-between' }}>
                        <span>{l.text}</span>
                        <span style={{ color: '#94a3b8' }}>{timeAgo(l.at)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* SLOT INSPECTION MODAL */}
      {inspectSlotData && (
        <div className="modal on">
          <div className="modal-panel inspector-panel">
            <div className="modal-head inspector-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="inspector-pill">{inspectSlotData.slot.id}</span>
                <div>
                  <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>
                    {inspectSlotData.rack.name} · {inspectSlotData.rack.zone}
                  </h3>
                  <div className="m-sub" style={{ color: '#94a3b8', fontSize: 10 }}>
                    Distance from dock: {inspectSlotData.rack.distanceFromDock} · Level {inspectSlotData.slot.level} · Bay {inspectSlotData.slot.bay}
                  </div>
                </div>
              </div>
              <button
                className="btn tiny"
                type="button"
                onClick={() => setInspectSlotId(null)}
                style={{ background: '#1e293b', color: '#fff', borderColor: '#334155' }}
              >
                ✕ Close
              </button>
            </div>

            <div className="modal-body inspector-body" style={{ padding: 0 }}>
              {/* Meters */}
              <div className="inspector-meters">
                <div className="insp-meter-card">
                  <div className="meter-head">
                    <span>VOLUME SPACE</span>
                    <b>{Math.round(usedVolume(inspectSlotData.slot))} / {inspectSlotData.slot.maxVolume || 800} L</b>
                  </div>
                  <div className="meter-bar">
                    <i style={{ width: `${slotFill(inspectSlotData.slot)}%` }}></i>
                  </div>
                  <small>{slotFill(inspectSlotData.slot)}% capacity utilized</small>
                </div>

                <div className="insp-meter-card">
                  <div className="meter-head">
                    <span>WEIGHT LOAD</span>
                    <b>{Math.round(usedWeight(inspectSlotData.slot))} / {inspectSlotData.slot.maxWeight || 400} kg</b>
                  </div>
                  <div className="meter-bar">
                    <i style={{ width: `${slotWeightFill(inspectSlotData.slot)}%` }}></i>
                  </div>
                  <small>{slotWeightFill(inspectSlotData.slot)}% weight load</small>
                </div>

                <div className="insp-meter-card">
                  <div className="meter-head">
                    <span>SLOT STATUS</span>
                    <b className={`insp-badge ${(inspectSlotData.slot.units || []).length === 0 ? 'vacant' : 'occupied'}`}>
                      {(inspectSlotData.slot.units || []).length === 0 ? 'VACANT' : 'OCCUPIED'}
                    </b>
                  </div>
                  <div style={{ fontSize: 10, color: '#64748b', marginTop: 8 }}>
                    {(inspectSlotData.slot.units || []).length === 0 ? 'Ready for inbound stock putaway.' : 'Nominal operating volume. Free space available.'}
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h4 style={{ fontSize: 12.5, fontWeight: 700, margin: 0 }}>📦 Stored Items</h4>
                  <span style={{ fontSize: 10, fontWeight: 700, background: '#e2e8f0', padding: '2px 8px', borderRadius: 12 }}>
                    {(inspectSlotData.slot.units || []).length} units
                  </span>
                </div>
                {(inspectSlotData.slot.units || []).length === 0 ? (
                  <div style={{ padding: 16, textAlign: 'center', color: '#94a3b8', fontSize: 11, background: '#fff', border: '1px dashed #cbd5e1', borderRadius: 6 }}>
                    Slot is vacant.
                  </div>
                ) : (
                  (inspectSlotData.slot.units || []).map((u, idx) => (
                    <div key={idx} className="insp-item-card">
                      <div className="insp-item-main">
                        <b>{u.sku}</b> — {u.name}
                        <span>{u.volume} L · {u.weight} kg per unit</span>
                      </div>
                      <div className="insp-item-tags">
                        <span className="insp-tag vel">{u.velocity}</span>
                        {u.fragile && <span className="insp-tag fragile">🛡️ FRAGILE</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Transfer Form (Supervisors only) */}
              {!isAdminView ? (
                <div style={{ padding: '18px 22px', background: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h4 style={{ fontSize: 12.5, fontWeight: 700, margin: 0 }}>⇄ Relocate Stock to Another Slot</h4>
                    <span style={{ fontSize: 10, color: '#64748b' }}>Validates volume, weight & fragility</span>
                  </div>

                  <form onSubmit={handleTransferSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1.4fr', gap: 12 }}>
                      <div>
                        <div className="field">SKU TO RELOCATE</div>
                        <select
                          value={transSku}
                          onChange={e => setTransSku(e.target.value)}
                          required
                        >
                          <option value="">Select item...</option>
                          {Array.from(new Set((inspectSlotData.slot.units || []).map(u => u.sku))).map(sku => (
                            <option key={sku} value={sku}>{sku}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <div className="field">QUANTITY</div>
                        <input
                          type="number"
                          value={transQty}
                          onChange={e => setTransQty(e.target.value)}
                          min="1"
                        />
                      </div>
                      <div>
                        <div className="field">DESTINATION SLOT</div>
                        <select
                          value={transTarget}
                          onChange={e => setTransTarget(e.target.value)}
                          required
                        >
                          <option value="">Choose target slot...</option>
                          {allSlots(warehouse)
                            .filter(s => s.slot.id !== inspectSlotData.slot.id)
                            .map(s => (
                              <option key={s.slot.id} value={s.slot.id}>
                                {s.slot.id} ({s.rack.name}) · {Math.round(freeVolume(s.slot))} L free
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    {transferAlert && (
                      <div className={`transfer-alert ${transferAlert.type}`} style={{ marginTop: 12, padding: 10, borderRadius: 6, fontSize: 11 }}>
                        {transferAlert.text}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                      <button type="submit" className="btn dark" style={{ flex: 1 }}>
                        ⇄ Execute Stock Relocation
                      </button>
                      <button
                        type="button"
                        className="btn"
                        onClick={handleQuickPick}
                        style={{ borderColor: '#fca5a5', color: '#dc2626', background: '#fef2f2' }}
                      >
                        📤 Quick Pick SKU
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div style={{ padding: 16, background: '#fffbeb', color: '#92400e', fontSize: 11.5, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span>🔒 Enterprise Admin View: Live slot telemetry is view-only. Stock relocation and picking are restricted to floor supervisors.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
