import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import CompanyDashboard from './pages/CompanyDashboard';
import WarehouseSelect from './pages/WarehouseSelect';
import WarehouseFloor from './pages/WarehouseFloor';
import Warehouse3D from './pages/Warehouse3D';
import PlatformAdmin from './pages/PlatformAdmin';

export default function App() {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/index.html" element={<LandingPage />} />

      {/* Authentication */}
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signin.html" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/signup.html" element={<SignUpPage />} />

      {/* Company Admin Ledger */}
      <Route path="/company-dashboard" element={<CompanyDashboard />} />
      <Route path="/company-dashboard.html" element={<CompanyDashboard />} />
      <Route path="/admin" element={<CompanyDashboard />} />

      {/* Supervisor Warehouse Picker */}
      <Route path="/warehouse-select" element={<WarehouseSelect />} />
      <Route path="/warehouse-select.html" element={<WarehouseSelect />} />
      <Route path="/select" element={<WarehouseSelect />} />

      {/* Supervisor Floor Map */}
      <Route path="/warehouse-floor" element={<WarehouseFloor />} />
      <Route path="/warehouse-floor.html" element={<WarehouseFloor />} />
      <Route path="/floor" element={<WarehouseFloor />} />

      {/* 3D Spatial View */}
      <Route path="/warehouse-3d" element={<Warehouse3D />} />
      <Route path="/warehouse-3d.html" element={<Warehouse3D />} />
      <Route path="/3d" element={<Warehouse3D />} />

      {/* Platform Administration Console */}
      <Route path="/platform-admin" element={<PlatformAdmin />} />
      <Route path="/platform-admin.html" element={<PlatformAdmin />} />
      <Route path="/platform" element={<PlatformAdmin />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
