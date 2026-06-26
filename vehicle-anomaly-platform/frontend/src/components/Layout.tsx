import { Outlet, NavLink } from 'react-router-dom';
import { useTelemetry } from '../context/TelemetryContext';
import { Activity, LayoutDashboard, ShieldAlert, CarFront } from 'lucide-react';

export default function Layout() {
  const { isConnected } = useTelemetry();

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <nav className="sidebar glass-panel">
        <div className="sidebar-header">
          <Activity size={28} className="brand-icon" />
          <h1 className="brand-title">Neon Sentinel</h1>
        </div>

        <div className="nav-links">
          <NavLink 
            to="/" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink 
            to="/anomalies" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <ShieldAlert size={20} />
            <span>Anomaly Logs</span>
          </NavLink>
          
          <NavLink 
            to="/vehicles" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <CarFront size={20} />
            <span>Fleet View</span>
          </NavLink>
        </div>

        <div className="sidebar-footer">
          <div className="connection-status">
            <span className={`pulse-dot ${!isConnected ? 'disconnected' : ''}`}></span>
            <span className="status-text">{isConnected ? 'System Online' : 'Reconnecting...'}</span>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
