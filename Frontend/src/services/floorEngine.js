import { getApiUrl } from './apiConfig';

export const FLOOR_KEYS = {
  warehousePrefix: 'optivault-warehouse-',
  active:          'optivault-active-warehouse',
  unlocked:        'optivault-unlocked',
  session:         'optivault-session',
  requests:        'optivault-warehouse-requests',
  extraSites:      'optivault-approved-warehouses',
  removedSites:    'optivault-removed-warehouses'
};

export const DEFAULT_WAREHOUSE_DIRECTORY = [
  {
    id: 'WH-MOH',
    name: 'Mohali — Phase 8 Yard',
    city: 'Mohali',
    address: 'Industrial Area Phase 8, Mohali',
    passcode: '4021',
    note: 'Main hub · fast-moving retail stock',
    company: 'Harbor & Bell Logistics'
  },
  {
    id: 'WH-CHD',
    name: 'Chandigarh — Industrial Area',
    city: 'Chandigarh',
    address: 'Industrial Area Phase 1, Chandigarh',
    passcode: '5530',
    note: 'City depot · mixed inventory',
    company: 'Harbor & Bell Logistics'
  },
  {
    id: 'WH-PAT',
    name: 'Patiala — Rajpura Road',
    city: 'Patiala',
    address: 'Rajpura Road, Patiala',
    passcode: '6174',
    note: 'Overflow store · bulk and slow movers',
    company: 'Harbor & Bell Logistics'
  }
];

export let WAREHOUSE_DIRECTORY = [...DEFAULT_WAREHOUSE_DIRECTORY];

export const RACK_PLANS = {
  'WH-MOH': [
    { id: 'A', name: 'Rack A', zone: 'Fast-pick',       distanceFromDock: 1, maxVolume: 900,  maxWeight: 450 },
    { id: 'F', name: 'Rack F', zone: 'Outbound stage',  distanceFromDock: 1, maxVolume: 600,  maxWeight: 300 },
    { id: 'C', name: 'Rack C', zone: 'Cold zone',       distanceFromDock: 2, maxVolume: 800,  maxWeight: 400 },
    { id: 'B', name: 'Rack B', zone: 'Bulk overrun',    distanceFromDock: 3, maxVolume: 1400, maxWeight: 900 },
    { id: 'E', name: 'Rack E', zone: 'Returns staging', distanceFromDock: 4, maxVolume: 700,  maxWeight: 350 },
    { id: 'D', name: 'Rack D', zone: 'Reserve cage',    distanceFromDock: 5, maxVolume: 1200, maxWeight: 700 }
  ],
  'WH-CHD': [
    { id: 'A', name: 'Rack A', zone: 'Fast-pick',      distanceFromDock: 1, maxVolume: 800,  maxWeight: 400 },
    { id: 'B', name: 'Rack B', zone: 'Outbound stage', distanceFromDock: 2, maxVolume: 700,  maxWeight: 350 },
    { id: 'C', name: 'Rack C', zone: 'General store',  distanceFromDock: 3, maxVolume: 1100, maxWeight: 650 },
    { id: 'D', name: 'Rack D', zone: 'Reserve cage',   distanceFromDock: 4, maxVolume: 1000, maxWeight: 600 },
    { id: 'E', name: 'Rack E', zone: 'Deep store',     distanceFromDock: 5, maxVolume: 1300, maxWeight: 800 }
  ],
  'WH-PAT': [
    { id: 'A', name: 'Rack A', zone: 'Fast-pick',    distanceFromDock: 1, maxVolume: 700,  maxWeight: 350 },
    { id: 'B', name: 'Rack B', zone: 'Bulk overrun', distanceFromDock: 2, maxVolume: 1500, maxWeight: 950 },
    { id: 'C', name: 'Rack C', zone: 'Deep store',   distanceFromDock: 4, maxVolume: 1400, maxWeight: 900 },
    { id: 'D', name: 'Rack D', zone: 'Reserve cage', distanceFromDock: 5, maxVolume: 1200, maxWeight: 700 }
  ]
};

export const SEED_STOCK = {
  'WH-MOH': [
    { sku: 'SKU-88213', name: 'Pallet wrap',     l: 100, w: 80, h: 70, weight: 22, velocity: 'fast',   fragile: false, qty: 16 },
    { sku: 'SKU-40410', name: 'Carton stock',    l: 80,  w: 60, h: 60, weight: 14, velocity: 'fast',   fragile: false, qty: 14 },
    { sku: 'SKU-21877', name: 'Label rolls',     l: 40,  w: 40, h: 30, weight: 4,  velocity: 'fast',   fragile: false, qty: 18 },
    { sku: 'SKU-12190', name: 'Bin flats',       l: 120, w: 80, h: 40, weight: 11, velocity: 'medium', fragile: false, qty: 12 },
    { sku: 'SKU-63155', name: 'Cold packs',      l: 90,  w: 70, h: 50, weight: 16, velocity: 'medium', fragile: false, qty: 9 },
    { sku: 'SKU-47720', name: 'Returns cartons', l: 70,  w: 50, h: 50, weight: 8,  velocity: 'medium', fragile: false, qty: 10 },
    { sku: 'SKU-73004', name: 'Spare motors',    l: 60,  w: 60, h: 60, weight: 28, velocity: 'slow',   fragile: false, qty: 9 },
    { sku: 'SKU-55021', name: 'Glass panels',    l: 100, w: 70, h: 40, weight: 20, velocity: 'slow',   fragile: true,  qty: 3 }
  ],
  'WH-CHD': [
    { sku: 'SKU-30112', name: 'Retail cartons',  l: 80,  w: 60, h: 50, weight: 12, velocity: 'fast',   fragile: false, qty: 12 },
    { sku: 'SKU-21877', name: 'Label rolls',     l: 40,  w: 40, h: 30, weight: 4,  velocity: 'fast',   fragile: false, qty: 14 },
    { sku: 'SKU-66840', name: 'Shelf brackets',  l: 90,  w: 50, h: 40, weight: 19, velocity: 'medium', fragile: false, qty: 10 },
    { sku: 'SKU-47720', name: 'Returns cartons', l: 70,  w: 50, h: 50, weight: 8,  velocity: 'medium', fragile: false, qty: 8 },
    { sku: 'SKU-55021', name: 'Glass panels',    l: 100, w: 70, h: 40, weight: 20, velocity: 'slow',   fragile: true,  qty: 2 },
    { sku: 'SKU-73004', name: 'Spare motors',    l: 60,  w: 60, h: 60, weight: 28, velocity: 'slow',   fragile: false, qty: 6 }
  ],
  'WH-PAT': [
    { sku: 'SKU-90355', name: 'Bulk sacks',      l: 110, w: 90, h: 60, weight: 34, velocity: 'slow',   fragile: false, qty: 9 },
    { sku: 'SKU-73004', name: 'Spare motors',    l: 60,  w: 60, h: 60, weight: 28, velocity: 'slow',   fragile: false, qty: 8 },
    { sku: 'SKU-12190', name: 'Bin flats',       l: 120, w: 80, h: 40, weight: 11, velocity: 'medium', fragile: false, qty: 7 },
    { sku: 'SKU-30112', name: 'Retail cartons',  l: 80,  w: 60, h: 50, weight: 12, velocity: 'fast',   fragile: false, qty: 6 }
  ]
};

export const ZONE_NAMES = [
  'Fast-pick', 'Outbound stage', 'General store',
  'Bulk overrun', 'Deep store', 'Reserve cage',
  'Returns staging', 'Overflow'
];

export const BAYS_PER_RACK = 4;
export const LEVELS_PER_BAY = 2;

// Storage helpers
export function loadApprovedSites() {
  try {
    const raw = localStorage.getItem(FLOOR_KEYS.extraSites);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

export function saveApprovedSites(list) {
  try {
    localStorage.setItem(FLOOR_KEYS.extraSites, JSON.stringify(list));
  } catch (err) {}
}

export function loadRemovedSites() {
  try {
    const raw = localStorage.getItem(FLOOR_KEYS.removedSites);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

export function saveRemovedSites(list) {
  try {
    localStorage.setItem(FLOOR_KEYS.removedSites, JSON.stringify(list));
  } catch (err) {}
}

export function mergeApprovedSites() {
  const removed = loadRemovedSites();
  const approved = loadApprovedSites().filter(site => site && site.id && !removed.includes(site.id));

  // Reset to default minus removed
  WAREHOUSE_DIRECTORY = DEFAULT_WAREHOUSE_DIRECTORY.filter(entry => !removed.includes(entry.id));

  approved.forEach(site => {
    const existing = WAREHOUSE_DIRECTORY.find(entry => entry.id === site.id);
    if (existing) {
      existing.name = site.name || existing.name;
      existing.city = site.city || existing.city;
      existing.address = site.address || existing.address;
      existing.passcode = site.passcode || existing.passcode;
      existing.note = site.note || existing.note;
      existing.company = site.company || existing.company;
    } else {
      WAREHOUSE_DIRECTORY.push({
        id: site.id,
        name: site.name,
        city: site.city,
        address: site.address,
        passcode: site.passcode,
        note: site.note,
        company: site.company,
        openedAt: site.openedAt
      });
    }
    if (site.rackPlan && site.rackPlan.length) {
      RACK_PLANS[site.id] = site.rackPlan;
    }
  });

  return WAREHOUSE_DIRECTORY;
}

mergeApprovedSites();

export function warehouseInfo(id) {
  mergeApprovedSites();
  let found = WAREHOUSE_DIRECTORY.find(entry => entry.id === id);
  if (!found) {
    const approved = loadApprovedSites();
    found = approved.find(entry => entry.id === id) || null;
    if (found && !WAREHOUSE_DIRECTORY.some(e => e.id === id)) {
      WAREHOUSE_DIRECTORY.push(found);
    }
  }
  return found || null;
}

export function warehousesForCompany(companyName) {
  mergeApprovedSites();
  if (!companyName || companyName === 'Demo company' || companyName === 'Harbor & Bell Logistics') {
    return WAREHOUSE_DIRECTORY.filter(entry => 
      !entry.company || 
      entry.company === 'Harbor & Bell Logistics' || 
      entry.company === 'Demo company'
    );
  }
  const norm = companyName.trim().toLowerCase();
  return WAREHOUSE_DIRECTORY.filter(entry => 
    entry.company && entry.company.trim().toLowerCase() === norm
  );
}

export async function syncWarehousesForCompany(companyName) {
  if (!companyName || companyName === 'Demo company') return [];
  try {
    const url = getApiUrl('/api/warehouse/company/' + encodeURIComponent(companyName));
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.warehouses)) {
        const approved = loadApprovedSites();
        const removed = loadRemovedSites();

        data.warehouses.forEach(w => {
          if (removed.includes(w.id)) return;
          const existing = WAREHOUSE_DIRECTORY.find(entry => entry.id === w.id);
          if (existing) {
            existing.name = w.name;
            if (w.city) existing.city = w.city;
            if (w.passcode) existing.passcode = w.passcode;
          } else {
            WAREHOUSE_DIRECTORY.push({
              id: w.id,
              name: w.name,
              city: w.city || 'Central Hub',
              address: w.city || 'Industrial Area',
              passcode: w.passcode || '1101',
              note: `${companyName} site`,
              company: companyName
            });
          }

          const appIdx = approved.findIndex(entry => entry.id === w.id);
          if (appIdx >= 0) {
            approved[appIdx].name = w.name;
            if (w.city) approved[appIdx].city = w.city;
            if (w.passcode) approved[appIdx].passcode = w.passcode;
          } else {
            approved.push({
              id: w.id,
              name: w.name,
              city: w.city || 'Central Hub',
              address: w.city || 'Industrial Area',
              passcode: w.passcode || '1101',
              note: `${companyName} site`,
              company: companyName
            });
          }
        });
        saveApprovedSites(approved);
        mergeApprovedSites();
      }
    }
  } catch (e) {}
  return warehousesForCompany(companyName);
}

export function buildRackPlan(slotsWanted) {
  const num = Number(slotsWanted) || 32;
  const rackCount = Math.max(2, Math.min(8, Math.round(num / 8)));
  const plan = [];
  for (let i = 0; i < rackCount; i++) {
    const letter = String.fromCharCode(65 + i);
    const deep = i >= rackCount / 2;
    plan.push({
      id: letter,
      name: 'Rack ' + letter,
      zone: ZONE_NAMES[i % ZONE_NAMES.length],
      distanceFromDock: i + 1,
      maxVolume: deep ? 1300 : 800,
      maxWeight: deep ? 800 : 400
    });
  }
  return plan;
}

export function buildEmptyWarehouse(id) {
  const info = warehouseInfo(id);
  let plan = RACK_PLANS[id];
  if (!plan || !plan.length) {
    if (info && info.rackPlan && info.rackPlan.length) {
      plan = info.rackPlan;
      RACK_PLANS[id] = plan;
    } else {
      plan = buildRackPlan(32);
      RACK_PLANS[id] = plan;
    }
  }

  const racks = plan.map(entry => {
    const slots = [];
    for (let bay = 1; bay <= BAYS_PER_RACK; bay++) {
      for (let level = 1; level <= LEVELS_PER_BAY; level++) {
        slots.push({
          id: `${entry.id}-${String(bay).padStart(2, '0')}-${level}`,
          rackId: entry.id,
          rackName: entry.name,
          zone: entry.zone,
          distanceFromDock: entry.distanceFromDock,
          bay: bay,
          level: level,
          maxVolume: entry.maxVolume || (entry.id >= 'E' ? 1300 : 800),
          maxWeight: entry.maxWeight || (entry.id >= 'E' ? 800 : 400),
          units: []
        });
      }
    }
    return {
      id: entry.id,
      name: entry.name,
      zone: entry.zone,
      distanceFromDock: entry.distanceFromDock,
      slots: slots
    };
  });

  return {
    id: id,
    name: info ? info.name : id,
    sector: info ? info.city : '',
    racks: racks,
    pending: [],
    log: []
  };
}

export function storageKeyFor(id) {
  return FLOOR_KEYS.warehousePrefix + id;
}

export function activeWarehouseId() {
  try {
    return localStorage.getItem(FLOOR_KEYS.active);
  } catch (e) {
    return null;
  }
}

export function loadWarehouse(id) {
  const targetId = id || activeWarehouseId() || 'WH-MOH';
  try {
    const raw = localStorage.getItem(storageKeyFor(targetId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.racks && Array.isArray(parsed.racks) && parsed.racks.length > 0) {
        return parsed;
      }
    }
  } catch (err) {}

  const fresh = buildEmptyWarehouse(targetId);
  (SEED_STOCK[targetId] || []).forEach(entry => {
    allocateBatch(fresh, expandToUnits(fresh, entry), { silent: true });
  });
  addLog(fresh, 'Warehouse map created with initial inventory.');
  saveWarehouse(fresh);
  return fresh;
}

export function saveWarehouse(warehouse) {
  if (!warehouse || !warehouse.id) return;
  try {
    localStorage.setItem(storageKeyFor(warehouse.id), JSON.stringify(warehouse));
  } catch (err) {}

  // Sync state to MongoDB Atlas
  try {
    const syncUrl = getApiUrl('/api/warehouse/sync');
    const session = (function () {
      try { return JSON.parse(localStorage.getItem(FLOOR_KEYS.session)); } catch (e) { return null; }
    })();
    const whMeta = warehouseInfo(warehouse.id);
    const currentCompany = (whMeta && whMeta.company) || (session && session.company) || '';

    fetch(syncUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        warehouseId: warehouse.id,
        companyName: currentCompany,
        name: whMeta ? whMeta.name : undefined,
        city: whMeta ? whMeta.city : undefined,
        passcode: whMeta ? whMeta.passcode : undefined,
        racks: warehouse.racks
      })
    }).catch(() => {});
  } catch (e) {}
}

export async function syncFromCloud(id) {
  try {
    const endpoint = getApiUrl('/api/warehouse/' + id);
    const res = await fetch(endpoint);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.warehouse && data.warehouse.racks && data.warehouse.racks.length) {
        saveWarehouse(data.warehouse);
        return data.warehouse;
      }
    }
  } catch (err) {}
  return null;
}

export function addLog(warehouse, text) {
  if (!warehouse.log) warehouse.log = [];
  warehouse.log.unshift({ text: text, at: Date.now() });
  warehouse.log = warehouse.log.slice(0, 30);
}

// Volume, Weight, and Fill Calculations
export function volumeOf(l, w, h) {
  return (Number(l) * Number(w) * Number(h)) / 1000;
}

export function usedVolume(slot) {
  if (!slot || !slot.units) return 0;
  return slot.units.reduce((total, unit) => total + (Number(unit.volume) || 0), 0);
}

export function usedWeight(slot) {
  if (!slot || !slot.units) return 0;
  return slot.units.reduce((total, unit) => total + (Number(unit.weight) || 0), 0);
}

export function freeVolume(slot) {
  return (slot.maxVolume || 900) - usedVolume(slot);
}

export function freeWeight(slot) {
  return (slot.maxWeight || 400) - usedWeight(slot);
}

export function slotFill(slot) {
  const max = slot.maxVolume || 900;
  return max ? Math.round((usedVolume(slot) / max) * 100) : 0;
}

export function slotWeightFill(slot) {
  const max = slot.maxWeight || 400;
  return max ? Math.round((usedWeight(slot) / max) * 100) : 0;
}

export function rackFill(rack) {
  if (!rack || !rack.slots) return 0;
  const capacity = rack.slots.reduce((total, slot) => total + (slot.maxVolume || 900), 0);
  const filled = rack.slots.reduce((total, slot) => total + usedVolume(slot), 0);
  return capacity ? Math.round((filled / capacity) * 100) : 0;
}

export function allSlots(warehouse) {
  if (!warehouse || !warehouse.racks) return [];
  return warehouse.racks.flatMap(rack =>
    (rack.slots || []).map(slot => ({ slot: slot, rack: rack }))
  );
}

export function findSlotById(warehouse, slotId) {
  const wanted = String(slotId).trim().toUpperCase();
  return allSlots(warehouse).find(entry => entry.slot.id === wanted) || null;
}

export function hasFragile(slot) {
  return (slot.units || []).some(unit => unit.fragile);
}

export function warehouseStats(warehouse) {
  const slots = allSlots(warehouse);
  const capacity = slots.reduce((t, e) => t + (e.slot.maxVolume || 800), 0);
  const filled = slots.reduce((t, e) => t + usedVolume(e.slot), 0);
  const empty = slots.filter(e => !e.slot.units || e.slot.units.length === 0).length;
  return {
    capacityUsed: capacity ? Math.round((filled / capacity) * 100) : 0,
    usedLitres: Math.round(filled),
    totalLitres: Math.round(capacity),
    emptySlots: empty,
    totalSlots: slots.length,
    rackCount: warehouse && warehouse.racks ? warehouse.racks.length : 0,
    pending: warehouse && warehouse.pending ? warehouse.pending.length : 0
  };
}

// Allocation Algorithm
export function expandToUnits(warehouse, entry) {
  const units = [];
  const vol = volumeOf(entry.l, entry.w, entry.h);
  const count = Number(entry.qty) || 1;
  for (let i = 0; i < count; i++) {
    units.push({
      ref: 'U' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      sku: entry.sku,
      name: entry.name,
      l: Number(entry.l),
      w: Number(entry.w),
      h: Number(entry.h),
      volume: Number(vol.toFixed(2)),
      weight: Number(entry.weight),
      velocity: entry.velocity || 'medium',
      fragile: Boolean(entry.fragile),
      addedAt: Date.now()
    });
  }
  return units;
}

export function slotAccepts(slot, unit) {
  if (unit.volume > slot.maxVolume) {
    return { ok: false, reason: 'Unit is larger than slot volume' };
  }
  if (usedVolume(slot) + unit.volume > slot.maxVolume) {
    return { ok: false, reason: 'Not enough volume remaining' };
  }
  if (usedWeight(slot) + unit.weight > (slot.maxWeight || 400)) {
    return { ok: false, reason: 'Exceeds slot maximum load rating' };
  }
  if (hasFragile(slot)) {
    return { ok: false, reason: 'Slot contains fragile inventory' };
  }
  if (unit.fragile && slot.units && slot.units.length > 0) {
    return { ok: false, reason: 'Fragile unit requires an isolated slot' };
  }
  return { ok: true };
}

export function rankSlots(candidates, unit) {
  const distances = candidates.map(entry => entry.rack.distanceFromDock || 1);
  const middle = (Math.min(...distances) + Math.max(...distances)) / 2;

  return candidates.slice().sort((a, b) => {
    const da = a.rack.distanceFromDock || 1;
    const db = b.rack.distanceFromDock || 1;

    if (unit.velocity === 'fast' && da !== db) {
      return da - db; // Near dock
    }
    if (unit.velocity === 'slow' && da !== db) {
      return db - da; // Deep in warehouse
    }
    if (unit.velocity === 'medium') {
      const offsetA = Math.abs(da - middle);
      const offsetB = Math.abs(db - middle);
      if (offsetA !== offsetB) return offsetA - offsetB;
    }
    // Least leftover space tie-break
    return (freeVolume(a.slot) - unit.volume) - (freeVolume(b.slot) - unit.volume);
  });
}

export function findSlotDetailed(warehouse, unit) {
  const everySlot = allSlots(warehouse);
  const candidates = everySlot.filter(entry => slotAccepts(entry.slot, unit).ok);

  if (candidates.length === 0) {
    return { target: null, ranked: [], totalSlots: everySlot.length };
  }
  const ranked = rankSlots(candidates, unit);
  return { target: ranked[0], ranked: ranked, totalSlots: everySlot.length };
}

export function explainChoice(ranked, unit) {
  const chosen = ranked[0];
  const distances = ranked.map(entry => entry.rack.distanceFromDock);
  const spread = Array.from(new Set(distances)).sort((a, b) => a - b);
  const leftover = Math.round(freeVolume(chosen.slot) - unit.volume);

  let rule = 'Tightest fit';
  let text = '';

  if (spread.length > 1 && unit.velocity === 'fast') {
    rule = 'Velocity';
    text = `Fast mover: nearest rack with room selected. ${chosen.rack.name} is ${chosen.rack.distanceFromDock} step(s) from dock.`;
  } else if (spread.length > 1 && unit.velocity === 'slow') {
    rule = 'Velocity';
    text = `Slow mover: placed deep in warehouse (${chosen.rack.name}, distance ${chosen.rack.distanceFromDock}) to leave dock lanes open.`;
  } else if (spread.length > 1 && unit.velocity === 'medium') {
    rule = 'Velocity';
    const middle = (Math.min(...distances) + Math.max(...distances)) / 2;
    text = `Medium mover: placed in mid-floor zone (${chosen.rack.name}, distance ${chosen.rack.distanceFromDock}, target ${middle}).`;
  } else {
    text = `All eligible slots were equidistant from the dock; slot chosen based on optimal cubic utilization (${leftover} L left).`;
  }

  return {
    rule,
    text,
    leftover,
    considered: ranked.length
  };
}

export function whyNothingFits(warehouse, unit) {
  const reasons = allSlots(warehouse)
    .map(entry => slotAccepts(entry.slot, unit).reason)
    .filter(Boolean);

  if (reasons.length === 0) return 'No eligible slot available';

  const tally = {};
  reasons.forEach(reason => { tally[reason] = (tally[reason] || 0) + 1; });
  return Object.keys(tally).sort((a, b) => tally[b] - tally[a])[0];
}

export function allocateBatch(warehouse, units, options = {}) {
  const queue = units.slice().sort((a, b) => b.volume - a.volume);
  const placed = [];
  const rejected = [];

  queue.forEach((unit, index) => {
    const search = findSlotDetailed(warehouse, unit);
    const target = search.target;

    if (target) {
      const why = explainChoice(search.ranked, unit);
      unit.slotId = target.slot.id;
      if (!target.slot.units) target.slot.units = [];
      target.slot.units.push(unit);

      placed.push({
        unit: unit,
        slotId: target.slot.id,
        rack: target.rack.name,
        rackId: target.rack.id,
        zone: target.rack.zone,
        distance: target.rack.distanceFromDock,
        queuePosition: index + 1,
        queueSize: queue.length,
        totalSlots: search.totalSlots,
        why: why
      });
    } else {
      rejected.push({
        unit: unit,
        reason: whyNothingFits(warehouse, unit),
        queuePosition: index + 1,
        queueSize: queue.length
      });
      if (!warehouse.pending) warehouse.pending = [];
      warehouse.pending.push(unit);
    }
  });

  if (!options.silent && placed.length) {
    addLog(warehouse, `Placed ${placed.length} unit${placed.length > 1 ? 's' : ''} of ${queue[0].sku}.`);
  }

  return { placed, rejected };
}

export function addStock(warehouse, entry) {
  const units = expandToUnits(warehouse, entry);
  const result = allocateBatch(warehouse, units);

  if (result.rejected.length) {
    addLog(warehouse, `${result.rejected.length} unit${result.rejected.length > 1 ? 's' : ''} of ${entry.sku} queued (waiting space).`);
  }
  saveWarehouse(warehouse);
  return result;
}

export function runReallocation(warehouse) {
  if (!warehouse.pending || warehouse.pending.length === 0) return [];

  const waiting = warehouse.pending.slice();
  warehouse.pending = [];
  const result = allocateBatch(warehouse, waiting, { silent: true });

  if (result.placed.length) {
    addLog(warehouse, `Reallocation auto-placed ${result.placed.length} waiting unit${result.placed.length > 1 ? 's' : ''}.`);
  }
  return result.placed;
}

export function removeStock(warehouse, slotId, sku, quantity) {
  const target = findSlotById(warehouse, slotId);
  if (!target) {
    return { ok: false, message: `No slot called ${slotId} on floor.` };
  }

  const wanted = String(sku).trim().toUpperCase();
  const matching = (target.slot.units || []).filter(unit => unit.sku.toUpperCase() === wanted);
  if (matching.length === 0) {
    return { ok: false, message: `${slotId} contains no units of ${sku}.` };
  }

  const count = Math.min(Number(quantity) || 1, matching.length);
  const removing = matching.slice(0, count);
  const removingRefs = new Set(removing.map(u => u.ref));
  const freedVolume = removing.reduce((total, unit) => total + unit.volume, 0);
  const freedWeight = removing.reduce((total, unit) => total + unit.weight, 0);

  target.slot.units = target.slot.units.filter(unit => !removingRefs.has(unit.ref));
  addLog(warehouse, `Removed ${count} × ${wanted} from ${target.slot.id}.`);

  // Persist stock removal to cloud
  try {
    const removeUrl = getApiUrl('/api/warehouse/remove');
    fetch(removeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        warehouseId: warehouse.id,
        slotId: target.slot.id,
        sku: wanted,
        quantity: count
      })
    }).catch(() => {});
  } catch (e) {}

  const moved = runReallocation(warehouse);
  saveWarehouse(warehouse);

  return {
    ok: true,
    removed: count,
    sku: wanted,
    slotId: target.slot.id,
    rack: target.rack.name,
    freedVolume: Math.round(freedVolume),
    freedWeight: Math.round(freedWeight),
    slotFillNow: slotFill(target.slot),
    reallocated: moved.length,
    reallocatedDetail: moved
  };
}

export async function transferStock(warehouse, fromSlotId, toSlotId, sku, quantity) {
  const fromTarget = findSlotById(warehouse, fromSlotId);
  const toTarget = findSlotById(warehouse, toSlotId);

  if (!fromTarget) return { ok: false, message: 'Source slot not found.' };
  if (!toTarget) return { ok: false, message: 'Destination slot not found.' };

  const qty = Number(quantity) || 1;
  const wanted = String(sku).trim().toUpperCase();
  const available = (fromTarget.slot.units || []).filter(u => u.sku.toUpperCase() === wanted);

  if (available.length < qty) {
    return { ok: false, message: `Only ${available.length} unit(s) of ${sku} available in ${fromSlotId}.` };
  }

  const movingUnits = available.slice(0, qty);
  const movingVolume = movingUnits.reduce((acc, u) => acc + u.volume, 0);
  const movingWeight = movingUnits.reduce((acc, u) => acc + u.weight, 0);

  if (freeVolume(toTarget.slot) < movingVolume) {
    return { ok: false, message: `Destination slot ${toSlotId} lacks volume for ${movingVolume.toFixed(1)} L.` };
  }
  if (freeWeight(toTarget.slot) < movingWeight) {
    return { ok: false, message: `Destination slot ${toSlotId} exceeds max weight rating.` };
  }

  // Remove from source
  const movingRefs = new Set(movingUnits.map(u => u.ref));
  fromTarget.slot.units = fromTarget.slot.units.filter(u => !movingRefs.has(u.ref));

  // Add to target
  movingUnits.forEach(u => {
    u.slotId = toTarget.slot.id;
    toTarget.slot.units.push(u);
  });

  addLog(warehouse, `Relocated ${qty} × ${sku} from ${fromSlotId} to ${toSlotId}.`);
  saveWarehouse(warehouse);

  // Cloud API sync
  try {
    const url = getApiUrl('/api/warehouse/transfer');
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        warehouseId: warehouse.id,
        fromSlotId,
        toSlotId,
        sku: wanted,
        quantity: qty
      })
    });
  } catch (e) {}

  return { ok: true, message: `Relocated ${qty} × ${sku} to ${toSlotId}.` };
}

export function resetWarehouse(id) {
  const fresh = buildEmptyWarehouse(id);
  saveWarehouse(fresh);

  try {
    const url = getApiUrl('/api/warehouse/reset');
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ warehouseId: id })
    }).catch(() => {});
  } catch (e) {}

  return fresh;
}

export function buildSuggestions(warehouse) {
  if (!warehouse || !warehouse.racks) return [];
  const list = [];

  // Rack pressure check
  warehouse.racks.forEach(rack => {
    const fill = rackFill(rack);
    if (fill >= 90) {
      const roomier = warehouse.racks
        .filter(other => other.id !== rack.id && rackFill(other) < 60)
        .sort((a, b) =>
          ((a.distanceFromDock || 1) - (b.distanceFromDock || 1)) || (rackFill(a) - rackFill(b))
        )[0];

      list.push({
        severity: 'high',
        type: 'Rack pressure',
        title: roomier
          ? `${rack.name} is ${fill}% full — recommend putaway redirection to ${roomier.name}`
          : `${rack.name} is ${fill}% full — critical capacity; no adjacent rack available`
      });
    }
  });

  // Overfill check
  warehouse.racks.forEach(rack => {
    const tight = (rack.slots || []).filter(slot => slotFill(slot) >= 92);
    if (tight.length && rackFill(rack) < 90) {
      list.push({
        severity: 'medium',
        type: 'Overfill',
        title: tight.length === 1
          ? `${tight[0].id} at ${slotFill(tight[0])}% — ${Math.round(freeVolume(tight[0]))} L space left`
          : `${tight.length} slots in ${rack.name} exceed 92% fill threshold`
      });
    }
  });

  // Waiting units check
  if (warehouse.pending && warehouse.pending.length) {
    const grouped = {};
    warehouse.pending.forEach(unit => {
      grouped[unit.sku] = (grouped[unit.sku] || 0) + 1;
    });
    Object.keys(grouped).forEach(sku => {
      list.push({
        severity: 'high',
        type: 'Waiting',
        title: `${grouped[sku]} × ${sku} queued in overflow — free slots to initiate placement`
      });
    });
  }

  // Travel time optimization check
  const nearOpen = allSlots(warehouse)
    .filter(entry => (entry.rack.distanceFromDock || 1) <= 2 && freeVolume(entry.slot) > 0);

  warehouse.racks
    .filter(rack => (rack.distanceFromDock || 1) >= 4)
    .forEach(rack => {
      (rack.slots || []).forEach(slot => {
        (slot.units || [])
          .filter(unit => unit.velocity === 'fast')
          .slice(0, 1)
          .forEach(unit => {
            const better = nearOpen.find(entry => slotAccepts(entry.slot, unit).ok);
            if (better) {
              list.push({
                severity: 'medium',
                type: 'Travel time',
                title: `${unit.sku} is a fast mover in ${rack.name} — transfer to ${better.slot.id} nearer the dock`
              });
            }
          });
      });
    });

  return list;
}

// Requisitions and approvals
export function loadRequests() {
  try {
    const raw = localStorage.getItem(FLOOR_KEYS.requests);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

export function saveRequests(list) {
  try {
    localStorage.setItem(FLOOR_KEYS.requests, JSON.stringify(list));
  } catch (err) {}
}

export function makeRequestRef() {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `REQ-${year}-${random}`;
}

export function submitWarehouseRequest(details) {
  const list = loadRequests();
  const request = {
    ref: makeRequestRef(),
    type: 'open',
    company: details.company,
    city: details.city,
    address: details.address,
    proposedSlots: Number(details.proposedSlots) || 32,
    contact: details.contact,
    note: details.note || '',
    status: 'pending',
    submittedAt: Date.now(),
    decidedAt: null
  };
  list.unshift(request);
  saveRequests(list);
  return request;
}

export function requestsForCompany(company) {
  if (!company) return [];
  const norm = company.trim().toLowerCase();
  return loadRequests().filter(entry => entry.company && entry.company.trim().toLowerCase() === norm);
}

export function makeSiteId(city) {
  const base = 'WH-' + (city || 'FAC').replace(/[^a-z]/gi, '').slice(0, 3).toUpperCase();
  let candidate = base;
  let counter = 2;
  const approved = loadApprovedSites();
  const allIds = new Set([...WAREHOUSE_DIRECTORY.map(e => e.id), ...approved.map(e => e.id)]);
  while (allIds.has(candidate)) {
    candidate = base + counter;
    counter++;
  }
  return candidate;
}

export function makePasscode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function approveWarehouseRequest(ref) {
  const list = loadRequests();
  const request = list.find(entry => entry.ref === ref);
  if (!request || request.status !== 'pending') return null;

  const site = {
    id: makeSiteId(request.city),
    city: request.city,
    name: request.city + ' — ' + (request.address || 'Central Facility').split(',')[0],
    address: request.address,
    passcode: makePasscode(),
    note: 'Commissioned from requisition ' + request.ref,
    company: request.company,
    openedAt: Date.now(),
    rackPlan: buildRackPlan(request.proposedSlots)
  };

  const approved = loadApprovedSites();
  approved.push(site);
  saveApprovedSites(approved);
  mergeApprovedSites();

  loadWarehouse(site.id);

  request.status = 'approved';
  request.decidedAt = Date.now();
  request.warehouseId = site.id;
  request.passcode = site.passcode;
  saveRequests(list);

  return { request, site };
}

export function rejectWarehouseRequest(ref, reason = '') {
  const list = loadRequests();
  const request = list.find(entry => entry.ref === ref);
  if (!request || request.status !== 'pending') return null;

  request.status = 'rejected';
  request.decidedAt = Date.now();
  request.reason = reason;
  saveRequests(list);
  return request;
}

export function submitDeleteRequest(details) {
  const list = loadRequests();
  const request = {
    ref: makeRequestRef(),
    type: 'delete',
    company: details.company,
    warehouseId: details.warehouseId,
    city: details.city,
    note: details.note || '',
    status: 'pending',
    submittedAt: Date.now(),
    decidedAt: null
  };
  list.unshift(request);
  saveRequests(list);
  return request;
}

export function approveDeleteRequest(ref) {
  const list = loadRequests();
  const request = list.find(entry => entry.ref === ref && entry.type === 'delete');
  if (!request || request.status !== 'pending') return null;

  const removed = loadRemovedSites();
  if (!removed.includes(request.warehouseId)) removed.push(request.warehouseId);
  saveRemovedSites(removed);

  WAREHOUSE_DIRECTORY = WAREHOUSE_DIRECTORY.filter(entry => entry.id !== request.warehouseId);
  saveApprovedSites(loadApprovedSites().filter(site => site.id !== request.warehouseId));

  try {
    localStorage.removeItem(FLOOR_KEYS.warehousePrefix + request.warehouseId);
  } catch (err) {}

  request.status = 'approved';
  request.decidedAt = Date.now();
  saveRequests(list);
  return request;
}

export function rejectDeleteRequest(ref) {
  const list = loadRequests();
  const request = list.find(entry => entry.ref === ref && entry.type === 'delete');
  if (!request) return null;
  request.status = 'rejected';
  request.decidedAt = Date.now();
  saveRequests(list);
  return request;
}

export function deleteWarehouseRequest(ref) {
  const list = loadRequests();
  const next = list.filter(entry => entry.ref !== ref);
  saveRequests(next);
  return true;
}

// Formatters
export function initialsOf(name) {
  if (!name) return '—';
  return name.split(/[\s&]+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'OV';
}

export function timeAgo(ts) {
  if (!ts) return 'recently';
  const diffSec = Math.floor((Date.now() - Number(ts)) / 1000);
  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}
