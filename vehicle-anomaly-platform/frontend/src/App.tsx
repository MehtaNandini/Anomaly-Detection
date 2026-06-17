import { useEffect, useState, useRef } from 'react';
import type { Telemetry, Alert } from './types';
import { Activity, Car, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import './index.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const WS_URL = API_BASE.startsWith('http') 
  ? API_BASE.replace('http', 'ws') + '/ws/live'
  : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}${API_BASE}/ws/live`;

function App() {
  const [telemetry, setTelemetry] = useState<Telemetry[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [vehicles, setVehicles] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Initial fetch
    fetch(`${API_BASE}/telemetry/latest`)
      .then((res) => res.json())
      .then(setTelemetry)
      .catch(console.error);

    fetch(`${API_BASE}/alerts`)
      .then((res) => res.json())
      .then(setAlerts)
      .catch(console.error);

    fetch(`${API_BASE}/vehicles`)
      .then((res) => res.json())
      .then(setVehicles)
      .catch(console.error);

    // WebSocket connect
    const connectWs = () => {
      const ws = new WebSocket(WS_URL);
      
      ws.onopen = () => setIsConnected(true);
      
      ws.onmessage = (event) => {
        const data: Telemetry = JSON.parse(event.data);
        
        setTelemetry((prev) => [data, ...prev].slice(0, 100));
        
        if (data.is_anomaly) {
          const newAlert: Alert = {
            id: data.id,
            vehicle_id: data.vehicle_id,
            severity: data.severity,
            fault_type: data.fault_type,
            created_at: data.created_at,
            ai_explanation: data.ai_explanation
          };
          setAlerts((prev) => [newAlert, ...prev].slice(0, 50));
        }

        setVehicles((prev) => prev.includes(data.vehicle_id) ? prev : [...prev, data.vehicle_id]);
      };

      ws.onclose = () => {
        setIsConnected(false);
        setTimeout(connectWs, 3000); // Reconnect attempt
      };
      
      ws.onerror = () => ws.close();
      wsRef.current = ws;
    };

    connectWs();

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const getSeverityBadge = (severity: string) => {
    const s = severity.toLowerCase();
    if (s === 'normal') return 'status-normal';
    if (s === 'low') return 'status-low';
    if (s === 'medium') return 'status-medium';
    return 'status-high';
  };

  const highSeverityCount = alerts.filter(a => a.severity === 'High').length;
  const healthScore = Math.max(0, 100 - (alerts.length * 2) - (highSeverityCount * 5));

  return (
    <div className="dashboard-container">
      {/* Sidebar / Alert Panel */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="header-title">
          <Activity size={24} color="#3b82f6" />
          Live Alerts Engine
        </div>
        
        <div className="alert-panel">
          {alerts.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2rem' }}>
              No active anomalies detected.
            </div>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className={`alert-card ${alert.severity === 'Low' || alert.severity === 'Medium' ? 'warning' : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-primary)' }}>{alert.vehicle_id}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {new Date(alert.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <span className={`status-badge ${getSeverityBadge(alert.severity)}`}>
                    {alert.fault_type}
                  </span>
                </div>
                {alert.ai_explanation && (
                  <div className="ai-explanation">
                    <strong>AI Diagnostic:</strong> {alert.ai_explanation}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Header & Metrics */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Automotive Telemetry Platform</h2>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
              <span className={`pulse-dot ${!isConnected ? 'disconnected' : ''}`}></span>
              {isConnected ? 'System Online (Live)' : 'Reconnecting...'}
            </div>
          </div>
          
          <div className="metrics-grid">
            <div className="metric-card">
              <span className="metric-label"><Car size={16} /> Active Vehicles</span>
              <span className="metric-value">{vehicles.length}</span>
            </div>
            <div className="metric-card">
              <span className="metric-label"><Zap size={16} /> Events Processed</span>
              <span className="metric-value">{telemetry.length}+</span>
            </div>
            <div className="metric-card">
              <span className="metric-label"><AlertTriangle size={16} /> Active Faults</span>
              <span className="metric-value" style={{ color: alerts.length > 0 ? 'var(--warning)' : 'inherit' }}>
                {alerts.length}
              </span>
            </div>
            <div className="metric-card">
              <span className="metric-label"><ShieldCheck size={16} /> Fleet Health</span>
              <span className="metric-value" style={{ color: healthScore > 80 ? 'var(--success)' : healthScore > 50 ? 'var(--warning)' : 'var(--danger)' }}>
                {healthScore}%
              </span>
            </div>
          </div>
        </div>

        {/* Telemetry Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Vehicle ID</th>
                <th>Status</th>
                <th>Speed (km/h)</th>
                <th>RPM</th>
                <th>Engine Temp (C)</th>
                <th>NOx / CO2</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {telemetry.map((row) => (
                <tr key={row.id}>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {new Date(row.created_at).toLocaleTimeString()}
                  </td>
                  <td style={{ fontWeight: 600 }}>{row.vehicle_id}</td>
                  <td>
                    <span className={`status-badge ${getSeverityBadge(row.severity)}`}>
                      {row.severity}
                    </span>
                  </td>
                  <td>{row.speed}</td>
                  <td>{row.rpm}</td>
                  <td>
                    <span style={{ color: row.engine_temp > 110 ? 'var(--danger)' : 'inherit' }}>
                      {row.engine_temp}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: row.nox > 300 ? 'var(--danger)' : 'inherit' }}>{row.nox}</span> /{' '}
                    <span style={{ color: row.co2 > 280 ? 'var(--danger)' : 'inherit' }}>{row.co2}</span>
                  </td>
                  <td>
                    {row.anomaly_score.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
