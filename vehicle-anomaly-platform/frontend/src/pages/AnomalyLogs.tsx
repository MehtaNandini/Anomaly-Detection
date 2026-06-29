import { useEffect } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { ShieldAlert, Cpu, ExternalLink } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function AnomalyLogs() {
  const { alerts } = useTelemetry();
  const location = useLocation();

  useEffect(() => {
    if (alerts.length > 0 && location.hash) {
      const id = location.hash.substring(1);
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.5)';
          setTimeout(() => el.style.boxShadow = '', 3000);
        }
      }, 100);
    }
  }, [alerts, location.hash]);

  const getSeverityBadge = (severity: string) => {
    const s = severity.toLowerCase();
    if (s === 'normal') return 'status-normal';
    if (s === 'low') return 'status-low';
    if (s === 'medium') return 'status-medium';
    return 'status-high';
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldAlert size={28} className="critical-text" />
          <h2>Anomaly Logs & Diagnostics</h2>
        </div>
        <p className="subtitle">Real-time log of anomalies with Gemini AI root-cause analysis.</p>
      </header>

      <div className="anomaly-logs-container glass-panel">
        {alerts.length === 0 ? (
          <div className="empty-state">
            <ShieldAlert size={48} className="success-text mb-4" />
            <h3>All Systems Normal</h3>
            <p className="text-muted">No anomalies detected in the current session.</p>
          </div>
        ) : (
          <div className="logs-feed">
            {alerts.map((alert) => (
              <div key={alert.id} id={`alert-${alert.id}`} className={`log-card ${alert.severity === 'High' ? 'critical-border' : 'warning-border'}`} style={{ transition: 'box-shadow 0.5s ease' }}>
                <div className="log-header">
                  <div className="log-title">
                    <Link to={`/vehicle/${alert.vehicle_id}`} className="data-mono highlight hover-link">{alert.vehicle_id}</Link>
                    <span className="text-muted">•</span>
                    <span className="data-mono text-muted">{new Date(alert.created_at.replace('Z', '') + 'Z').toLocaleTimeString()}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Link to={`/history#log-${alert.id}`} className="hover-link" style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }} title="View in Global Telemetry History">
                      <ExternalLink size={14} /> View History
                    </Link>
                    <span className={`status-badge ${getSeverityBadge(alert.severity)}`}>{alert.severity}</span>
                  </div>
                </div>
                
                <div className="log-fault">
                  <span className="fault-label">Fault Type:</span> {alert.fault_type}
                </div>

                {alert.ai_explanation && (
                  <div className="ai-diagnostic-panel">
                    <div className="ai-header">
                      <Cpu size={16} />
                      <span>Gemini Diagnostic AI</span>
                    </div>
                    <div className="ai-body">
                      {alert.ai_explanation}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
