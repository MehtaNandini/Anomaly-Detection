import { useParams, Link } from 'react-router-dom';
import { useTelemetry } from '../context/TelemetryContext';
import { Activity, ArrowLeft, Thermometer, Gauge, Wind } from 'lucide-react';

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const { telemetry, alerts } = useTelemetry();

  const vehicleHistory = telemetry.filter(t => t.vehicle_id === id);
  const latest = vehicleHistory[0];
  const vehicleAlerts = alerts.filter(a => a.vehicle_id === id);

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
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Speed</th>
                  <th>RPM</th>
                  <th>Eng Temp</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {vehicleHistory.slice(0, 10).map((row) => (
                  <tr key={row.id}>
                    <td className="data-mono text-muted">{new Date(row.created_at).toLocaleTimeString()}</td>
                    <td className="data-mono">{row.speed}</td>
                    <td className="data-mono">{row.rpm}</td>
                    <td className="data-mono">{row.engine_temp}</td>
                    <td className="data-mono">{row.anomaly_score.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="column glass-panel side-alerts">
          <h3>Vehicle Alerts</h3>
          <div className="alert-list">
            {vehicleAlerts.length === 0 ? (
              <div className="text-muted p-4">No alerts recorded for this vehicle.</div>
            ) : (
              vehicleAlerts.slice(0, 5).map(alert => (
                <div key={alert.id} className="alert-item">
                  <div className="alert-header">
                    <span className="data-mono text-muted text-sm">{new Date(alert.created_at).toLocaleTimeString()}</span>
                    <span className={`status-badge ${getSeverityBadge(alert.severity)}`}>{alert.severity}</span>
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
