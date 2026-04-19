import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import FireIncidents from './pages/FireIncidents';
import MedicalEmergencies from './pages/MedicalEmergencies';
import RoadAccidents from './pages/RoadAccidents';
import RescueOperations from './pages/RescueOperations';
import SystemStatus from './pages/SystemStatus';
import StationManagement from './pages/StationManagement';
import Landing from './pages/Landing';
import Login from './pages/Login';
import './styles/leaflet-overrides.css';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Check if current route is a public page (Landing/Login)
  const isPublicPage = location.pathname === '/' || location.pathname === '/login';

  if (isPublicPage) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        sidebarCollapsed ? 'ml-20' : 'ml-64'
      }`}>

        <main className="flex-1 overflow-hidden">
          <div className="h-full">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/fire" element={<FireIncidents />} />
              <Route path="/medical" element={<MedicalEmergencies />} />
              <Route path="/accidents" element={<RoadAccidents />} />
              <Route path="/rescue" element={<RescueOperations />} />
              <Route path="/system" element={<SystemStatus />} />
              <Route path="/stations" element={<StationManagement />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
