import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  activeWarehouseId,
  warehouseInfo,
  loadWarehouse,
  syncFromCloud,
  allSlots,
  findSlotById,
  slotFill,
  usedVolume,
  usedWeight
} from '../services/floorEngine';

export default function Warehouse3D() {
  const [searchParams] = useSearchParams();
  const targetId = searchParams.get('id') || activeWarehouseId() || 'WH-MOH';

  const [warehouse, setWarehouse] = useState(() => loadWarehouse(targetId));
  const [rotation, setRotation] = useState(328);
  const [elevation, setElevation] = useState(24);
  const [zoom, setZoom] = useState(1);
  const [autoSpin, setAutoSpin] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'congested' | 'available'

  useEffect(() => {
    syncFromCloud(targetId).then(data => {
      if (data) setWarehouse(data);
    });
  }, [targetId]);

  useEffect(() => {
    if (!autoSpin) return;
    const interval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, [autoSpin]);

  const info = useMemo(() => warehouseInfo(targetId), [targetId]);
  const selectedSlot = useMemo(() => {
    if (!selectedSlotId) return null;
    return findSlotById(warehouse, selectedSlotId);
  }, [warehouse, selectedSlotId]);

  const handleExportCSV = () => {
    const rows = [
      ['Warehouse ID', 'Rack ID', 'Zone', 'Slot Code', 'Bay', 'Level', 'Fill %', 'Capacity (L)', 'Used (L)', 'Max Weight (kg)', 'Current Weight (kg)', 'SKUs Stored']
    ];

    allSlots(warehouse).forEach(entry => {
      const s = entry.slot;
      const r = entry.rack;
      const fill = slotFill(s);
      const usedKg = Math.round(usedWeight(s));
      const usedVol = Math.round(usedVolume(s));
      const skus = (s.units || []).map(u => u.sku).join('; ');

      rows.push([
        warehouse.id,
        r.id,
        r.zone,
        s.id,
        s.bay,
        s.level,
        fill + '%',
        s.maxVolume,
        usedVol,
        s.maxWeight,
        usedKg,
        `"${skus}"`
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `OptiVault_${warehouse.id}_Inventory_Manifest.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#090d16', color: '#f8fafc', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      {/* Top Application Bar */}
      <header style={{ height: 54, background: '#0f172a', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 800, letterSpacing: '0.1em' }}>
            OPTI<span style={{ color: '#f97316' }}>VAULT</span> 3D
          </Link>
          <span style={{ color: '#475569' }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#38bdf8' }}>{info?.name || targetId}</span>
          <span style={{ fontSize: 11, background: '#1e293b', padding: '2px 8px', borderRadius: 4, color: '#94a3b8' }}>
            {warehouse.racks?.length || 0} Racks · Spatial Model
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={handleExportCSV}
            style={{ background: '#1e293b', border: '1px solid #334155', color: '#f8fafc', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            📥 Export Manifest CSV
          </button>
          <Link
            to={`/warehouse-floor?id=${targetId}`}
            style={{ background: '#0284c7', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
          >
            ← 2D Floor Plan
          </Link>
        </div>
      </header>

      {/* Control Bar */}
      <div style={{ background: '#111827', borderBottom: '1px solid #1e293b', padding: '10px 20px', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', fontSize: 12 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            onClick={() => setAutoSpin(!autoSpin)}
            style={{ background: autoSpin ? '#0284c7' : '#1e293b', color: '#fff', border: '1px solid #334155', padding: '5px 10px', borderRadius: 4, cursor: 'pointer' }}
          >
            ⟳ Auto 360°
          </button>
          <button
            type="button"
            onClick={() => { setRotation(328); setElevation(24); setZoom(1); }}
            style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', padding: '5px 10px', borderRadius: 4, cursor: 'pointer' }}
          >
            Isometric
          </button>
          <button
            type="button"
            onClick={() => { setRotation(0); setElevation(80); }}
            style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', padding: '5px 10px', borderRadius: 4, cursor: 'pointer' }}
          >
            Top
          </button>
          <button
            type="button"
            onClick={() => { setRotation(90); setElevation(15); }}
            style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', padding: '5px 10px', borderRadius: 4, cursor: 'pointer' }}
          >
            Side
          </button>
          <button
            type="button"
            onClick={() => { setRotation(0); setElevation(15); }}
            style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', padding: '5px 10px', borderRadius: 4, cursor: 'pointer' }}
          >
            Front
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8' }}>
          <label>Rotation:</label>
          <input
            type="range"
            min="0"
            max="360"
            value={rotation}
            onChange={e => setRotation(Number(e.target.value))}
            style={{ width: 100 }}
          />
          <span>{rotation}°</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8' }}>
          <label>Elevation:</label>
          <input
            type="range"
            min="-10"
            max="80"
            value={elevation}
            onChange={e => setElevation(Number(e.target.value))}
            style={{ width: 80 }}
          />
          <span>{elevation}°</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            type="button"
            onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
            style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}
          >
            −
          </button>
          <span style={{ color: '#94a3b8' }}>{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            onClick={() => setZoom(z => Math.min(2, z + 0.1))}
            style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}
          >
            +
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
          <span style={{ color: '#64748b' }}>Filter:</span>
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            style={{ background: filterMode === 'all' ? '#0284c7' : '#1e293b', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: 4, fontSize: 11, cursor: 'pointer' }}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('congested')}
            style={{ background: filterMode === 'congested' ? '#ef4444' : '#1e293b', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: 4, fontSize: 11, cursor: 'pointer' }}
          >
            Congested (≥85%)
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('available')}
            style={{ background: filterMode === 'available' ? '#10b981' : '#1e293b', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: 4, fontSize: 11, cursor: 'pointer' }}
          >
            Available (&lt;85%)
          </button>
        </div>
      </div>

      {/* Main 3D Stage & Inspector Card */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: 1400 }}>
        <div
          style={{
            transform: `scale(${zoom}) rotateX(${elevation}deg) rotateY(${rotation}deg)`,
            transformStyle: 'preserve-3d',
            transition: autoSpin ? 'none' : 'transform 0.12s ease-out',
            display: 'grid',
            gridTemplateColumns: `repeat(${warehouse.racks?.length || 4}, 180px)`,
            gap: 40,
            padding: 60
          }}
        >
          {(warehouse.racks || []).map(rack => (
            <div
              key={rack.id}
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid #334155',
                borderRadius: 10,
                padding: 12,
                transformStyle: 'preserve-3d',
                boxShadow: '0 25px 30px -5px rgba(0,0,0,0.6)'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <strong style={{ color: '#38bdf8', fontSize: 13 }}>{rack.name}</strong>
                <div style={{ fontSize: 9.5, color: '#94a3b8' }}>{rack.zone}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {(rack.slots || []).map(slot => {
                  const fill = slotFill(slot);
                  const isCongested = fill >= 85;
                  if (filterMode === 'congested' && !isCongested) return null;
                  if (filterMode === 'available' && isCongested) return null;

                  const isSelected = selectedSlotId === slot.id;
                  const bg = isCongested ? '#ef4444' : fill >= 40 ? '#f59e0b' : '#10b981';

                  return (
                    <div
                      key={slot.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSlotId(slot.id);
                      }}
                      style={{
                        background: bg,
                        color: '#fff',
                        borderRadius: 6,
                        padding: '10px 4px',
                        textAlign: 'center',
                        fontSize: 10,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transform: isSelected ? 'scale(1.1) translateZ(15px)' : 'none',
                        border: isSelected ? '2px solid #fff' : 'none',
                        boxShadow: isSelected ? '0 0 15px #38bdf8' : '0 4px 6px rgba(0,0,0,0.4)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        userSelect: 'none'
                      }}
                    >
                      <div>{slot.id}</div>
                      <div style={{ fontSize: 9, opacity: 0.9 }}>{fill}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Floating Telemetry Card */}
        {selectedSlot && (
          <div
            style={{
              position: 'absolute',
              bottom: 24,
              right: 24,
              width: 320,
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: 8,
              padding: 16,
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.7)',
              zIndex: 100
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: 11 }}>
                {selectedSlot.slot.id}
              </span>
              <button
                type="button"
                onClick={() => setSelectedSlotId(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 14, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
              {selectedSlot.rack.name} · {selectedSlot.rack.zone}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12 }}>
              Distance: {selectedSlot.rack.distanceFromDock} · Bay {selectedSlot.slot.bay} · Level {selectedSlot.slot.level}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12, fontSize: 11 }}>
              <div style={{ background: '#1e293b', padding: 8, borderRadius: 4 }}>
                <span style={{ color: '#94a3b8' }}>VOLUME FILL</span>
                <div style={{ fontWeight: 700, fontSize: 13, marginTop: 2 }}>{slotFill(selectedSlot.slot)}%</div>
                <div style={{ fontSize: 9, color: '#64748b' }}>{Math.round(usedVolume(selectedSlot.slot))} / {selectedSlot.slot.maxVolume} L</div>
              </div>
              <div style={{ background: '#1e293b', padding: 8, borderRadius: 4 }}>
                <span style={{ color: '#94a3b8' }}>WEIGHT LOAD</span>
                <div style={{ fontWeight: 700, fontSize: 13, marginTop: 2 }}>{Math.round(usedWeight(selectedSlot.slot))} kg</div>
                <div style={{ fontSize: 9, color: '#64748b' }}>Max {selectedSlot.slot.maxWeight || 400} kg</div>
              </div>
            </div>

            <div style={{ fontSize: 11 }}>
              <strong style={{ color: '#cbd5e1' }}>Stored Inventory:</strong>
              <div style={{ marginTop: 4, maxHeight: 80, overflowY: 'auto' }}>
                {(selectedSlot.slot.units || []).length === 0 ? (
                  <span style={{ color: '#64748b' }}>Slot is vacant.</span>
                ) : (
                  Array.from(new Set((selectedSlot.slot.units || []).map(u => u.sku))).map(sku => (
                    <div key={sku} style={{ padding: '2px 0', color: '#38bdf8' }}>
                      • {sku} ({(selectedSlot.slot.units || []).filter(u => u.sku === sku).length} units)
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
