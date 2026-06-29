import { useTelemetry } from '../context/TelemetryContext';
import { Car, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { telemetry, alerts, vehicles } = useTelemetry();

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
    <div className="page-container">
      <header className="page-header">
        <h2>Fleet Command Dashboard</h2>
        <p className="subtitle">Real-time overview of all active vehicles and anomalies.</p>
      </header>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card glass-panel">
          <div className="metric-icon primary-glow"><Car size={24} /></div>
          <div className="metric-info">
            <span className="metric-label">Active Vehicles</span>
            <span className="metric-value">{vehicles.length}</span>
          </div>
        </div>
        
        <div className="metric-card glass-panel">
          <div className="metric-icon success-glow"><Zap size={24} /></div>
          <div className="metric-info">
            <span className="metric-label">Events Processed</span>
            <span className="metric-value">{telemetry.length}+</span>
          </div>
        </div>
        
        <div className="metric-card glass-panel">
          <div className={`metric-icon ${alerts.length > 0 ? 'warning-glow' : 'success-glow'}`}>
            <AlertTriangle size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Active Faults</span>
            <span className="metric-value" style={{ color: alerts.length > 0 ? 'var(--warning)' : 'inherit' }}>
              {alerts.length}
            </span>
          </div>
        </div>
        
        <div className="metric-card glass-panel">
          <div className={`metric-icon ${healthScore > 80 ? 'success-glow' : healthScore > 50 ? 'warning-glow' : 'critical-glow'}`}>
            <ShieldCheck size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Fleet Health</span>
            <span className="metric-value" style={{ color: healthScore > 80 ? 'var(--success)' : healthScore > 50 ? 'var(--warning)' : 'var(--danger)' }}>
              {healthScore}%
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-columns">
        {/* Recent Telemetry */}
        <div className="column glass-panel">
          <h3>Latest Telemetry Stream</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Vehicle ID</th>
                  <th>Status</th>
                  <th>Speed (km/h)</th>
                  <th>Score</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {telemetry.slice(0, 15).map((row) => (
                  <tr key={row.id}>
                    <td className="data-mono text-muted">{new Date(row.created_at.replace('Z', '') + 'Z').toLocaleTimeString()}</td>
                    <td className="data-mono highlight">{row.vehicle_id}</td>
                    <td><span className={`status-badge ${getSeverityBadge(row.severity)}`}>{row.severity}</span></td>
                    <td className="data-mono">{row.speed}</td>
                    <td className="data-mono">{row.anomaly_score.toFixed(2)}</td>
                    <td>
                      <Link to={`/vehicle/${row.vehicle_id}`} className="action-link">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Alerts Feed */}
        <div className="column glass-panel side-alerts">
          <h3>Recent Anomalies</h3>
          <div className="alert-list">
            {alerts.slice(0, 5).map(alert => (
              <Link to={`/vehicle/${alert.vehicle_id}`} key={alert.id} className="alert-item" style={{ textDecoration: 'none', display: 'block', transition: 'all 0.2s' }}>
                <div className="alert-header">
                  <span className="data-mono highlight">{alert.vehicle_id}</span>
                  <span className={`status-badge ${getSeverityBadge(alert.severity)}`}>{alert.severity}</span>
                </div>
                <div className="alert-fault" style={{ color: 'var(--text)' }}>{alert.fault_type}</div>
                <div className="data-mono text-muted text-sm">{new Date(alert.created_at.replace('Z', '') + 'Z').toLocaleTimeString()}</div>
              </Link>
            ))}
            {alerts.length === 0 && <div className="text-muted p-4">No recent anomalies.</div>}
            {alerts.length > 0 && (
              <Link to="/anomalies" className="view-all-link">View All Alerts →</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
