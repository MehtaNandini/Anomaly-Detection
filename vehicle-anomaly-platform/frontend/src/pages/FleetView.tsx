import { useTelemetry } from '../context/TelemetryContext';
import { CarFront } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FleetView() {
  const { vehicles, telemetry } = useTelemetry();

  // Get latest telemetry for each vehicle
  const latestByVehicle = vehicles.map(vid => {
    return telemetry.find(t => t.vehicle_id === vid);
  }).filter(Boolean);

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
          <CarFront size={28} className="primary-text" />
          <h2>Fleet View</h2>
        </div>
        <p className="subtitle">Directory of all active vehicles currently transmitting telemetry.</p>
      </header>

      <div className="fleet-grid">
        {latestByVehicle.map((data) => (
          data && (
            <div key={data.vehicle_id} className="vehicle-card glass-panel hover-glow">
              <div className="vehicle-card-header">
                <h3>{data.vehicle_id}</h3>
                <span className={`status-badge ${getSeverityBadge(data.severity)}`}>{data.severity}</span>
              </div>
              <div className="vehicle-card-body">
                <div className="metric-mini">
                  <span className="label">Speed</span>
                  <span className="value data-mono">{data.speed} km/h</span>
                </div>
                <div className="metric-mini">
                  <span className="label">RPM</span>
                  <span className="value data-mono">{data.rpm}</span>
                </div>
                <div className="metric-mini">
                  <span className="label">Score</span>
                  <span className="value data-mono">{data.anomaly_score.toFixed(2)}</span>
                </div>
              </div>
              <div className="vehicle-card-footer">
                <Link to={`/vehicle/${data.vehicle_id}`} className="button-primary">View Telemetry</Link>
              </div>
            </div>
          )
        ))}
        {vehicles.length === 0 && (
          <div className="empty-state text-muted">No vehicles tracked yet.</div>
        )}
      </div>
    </div>
  );
}
