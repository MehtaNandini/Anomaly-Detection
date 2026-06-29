import { useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useTelemetry } from '../context/TelemetryContext';
import { Activity, ArrowLeft, Thermometer, Gauge, Wind, ExternalLink } from 'lucide-react';

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const { telemetry, alerts } = useTelemetry();

  const vehicleHistory = telemetry.filter(t => t.vehicle_id === id);
  const latest = vehicleHistory[0];
  const vehicleAlerts = alerts.filter(a => a.vehicle_id === id);
  const location = useLocation();

  useEffect(() => {
    if (vehicleHistory.length > 0 && location.hash) {
      const hashId = location.hash.substring(1);
      setTimeout(() => {
        const el = document.getElementById(hashId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.style.backgroundColor = 'rgba(59, 130, 246, 0.3)';
          setTimeout(() => el.style.backgroundColor = '', 3000);
        }
      }, 100);
    }
  }, [vehicleHistory, location.hash]);

  if (!latest) {
    return (
      <div className="page-container">
        <header className="page-header">
          <Link to="/vehicles" className="back-link"><ArrowLeft size={16} /> Back to Fleet</Link>
          <h2>Vehicle Not Found or No Data</h2>
        </header>
      </div>
    );
  }

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
        <Link to="/vehicles" className="back-link hover-link"><ArrowLeft size={16} /> Back to Fleet</Link>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
          <h2>Telemetry: <span className="data-mono highlight">{id}</span></h2>
          <span className={`status-badge ${getSeverityBadge(latest.severity)}`}>{latest.severity}</span>
        </div>
      </header>

      {/* Gauges Grid */}
      <div className="telemetry-gauges-grid">
        <div className="gauge-card glass-panel">
          <div className="gauge-header"><Gauge size={16}/> Speed & RPM</div>
          <div className="gauge-values">
            <div className="main-val data-mono">{latest.speed} <span className="unit">km/h</span></div>
            <div className="sub-val data-mono">{latest.rpm} <span className="unit">RPM</span></div>
          </div>
        </div>

        <div className="gauge-card glass-panel">
          <div className="gauge-header"><Thermometer size={16}/> Temperatures</div>
          <div className="gauge-values">
            <div className={`main-val data-mono ${latest.engine_temp > 105 ? 'critical-text' : ''}`}>
              {latest.engine_temp} <span className="unit">°C Engine</span>
            </div>
            <div className="sub-val data-mono">{latest.exhaust_temp} <span className="unit">°C Exhaust</span></div>
          </div>
        </div>

        <div className="gauge-card glass-panel">
          <div className="gauge-header"><Wind size={16}/> Emissions</div>
          <div className="gauge-values">
            <div className={`main-val data-mono ${latest.nox > 200 ? 'warning-text' : ''}`}>
              {latest.nox} <span className="unit">NOx</span>
            </div>
            <div className="sub-val data-mono">{latest.co2} <span className="unit">CO2</span></div>
          </div>
        </div>
        
        <div className="gauge-card glass-panel">
          <div className="gauge-header"><Activity size={16}/> Load & Fuel</div>
          <div className="gauge-values">
            <div className="main-val data-mono">{latest.engine_load} <span className="unit">% Load</span></div>
            <div className="sub-val data-mono">{latest.fuel_rate} <span className="unit">L/h Fuel</span></div>
          </div>
        </div>
      </div>

      <div className="dashboard-columns mt-4">
        <div className="column glass-panel">
          <h3>Telemetry History</h3>
          <div className="table-container" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
            <div style={{ overflowX: 'auto', maxHeight: '400px' }}>
              <table className="w-full text-left border-collapse">
                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#1e3a8a', zIndex: 10, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)' }}>
                  <tr>
                    <th className="p-3 border-b border-[var(--border-color)]">Time</th>
                    <th className="p-3 border-b border-[var(--border-color)]">Status</th>
                    <th className="p-3 border-b border-[var(--border-color)]">Speed</th>
                    <th className="p-3 border-b border-[var(--border-color)]">RPM</th>
                    <th className="p-3 border-b border-[var(--border-color)]">Eng Temp</th>
                    <th className="p-3 border-b border-[var(--border-color)]">Exh Temp</th>
                    <th className="p-3 border-b border-[var(--border-color)]">NOx</th>
                    <th className="p-3 border-b border-[var(--border-color)]">CO2</th>
                    <th className="p-3 border-b border-[var(--border-color)]">Load</th>
                    <th className="p-3 border-b border-[var(--border-color)]">Fuel</th>
                    <th className="p-3 border-b border-[var(--border-color)]">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicleHistory.map((row) => (
                    <tr key={row.id} id={`log-${row.id}`} className="border-b border-[var(--border-color)] hover:bg-[rgba(255,255,255,0.02)] transition-colors" style={{ transition: 'background-color 0.5s ease' }}>
                      <td className="p-3 data-mono text-muted text-sm whitespace-nowrap">{new Date(row.created_at.replace('Z', '') + 'Z').toLocaleTimeString()}</td>
                      <td className="p-3"><span className={`status-badge ${getSeverityBadge(row.severity)}`}>{row.severity}</span></td>
                      <td className="p-3 data-mono text-sm">{row.speed.toFixed(1)}</td>
                      <td className="p-3 data-mono text-sm">{row.rpm.toFixed(0)}</td>
                      <td className="p-3 data-mono text-sm">{row.engine_temp.toFixed(1)}</td>
                      <td className="p-3 data-mono text-sm">{row.exhaust_temp.toFixed(1)}</td>
                      <td className="p-3 data-mono text-sm">{row.nox.toFixed(2)}</td>
                      <td className="p-3 data-mono text-sm">{row.co2.toFixed(1)}</td>
                      <td className="p-3 data-mono text-sm">{row.engine_load.toFixed(1)}</td>
                      <td className="p-3 data-mono text-sm">{row.fuel_rate.toFixed(1)}</td>
                      <td className="p-3 data-mono text-sm">{row.anomaly_score.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="column glass-panel side-alerts">
          <h3>Vehicle Alerts</h3>
          <div className="alert-list" style={{ overflowY: 'auto', maxHeight: '400px', paddingRight: '8px' }}>
            {vehicleAlerts.length === 0 ? (
              <div className="text-muted p-4">No alerts recorded for this vehicle.</div>
            ) : (
              vehicleAlerts.map(alert => (
                <div key={alert.id} className="alert-item">
                  <div className="alert-header">
                    <span className="data-mono text-muted text-sm">{new Date(alert.created_at.replace('Z', '') + 'Z').toLocaleTimeString()}</span>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <Link to={`/history#log-${alert.id}`} className="hover-link" title="View in Global Telemetry History" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <ExternalLink size={12} /> View History
                      </Link>
                      <span className={`status-badge ${getSeverityBadge(alert.severity)}`}>{alert.severity}</span>
                    </div>
                  </div>
                  <div className="alert-fault">{alert.fault_type}</div>
                  {alert.ai_explanation && (
                    <div className="ai-diagnostic-panel mt-2 text-sm">
                      {alert.ai_explanation}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
