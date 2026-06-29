import { useState, useEffect } from 'react';
import type { Telemetry } from '../types';
import { Link, useLocation } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

export default function HistoryLogs() {
  const [logs, setLogs] = useState<Telemetry[]>([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation();

  useEffect(() => {
    fetch('/api/telemetry/history')
      .then(res => res.json())
      .then(data => {
        setLogs(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!loading && location.hash) {
      const id = location.hash.substring(1);
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.style.backgroundColor = 'rgba(59, 130, 246, 0.3)';
          setTimeout(() => el.style.backgroundColor = '', 3000);
        }
      }, 500); // Increased timeout to wait for large tables to render
    }
  }, [loading, location.hash, logs]);

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
        <h2>Full Telemetry Logs</h2>
        <p className="subtitle">Comprehensive history of all vehicle sensor data.</p>
      </header>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading full history...</div>
        ) : (
          <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 'calc(100vh - 150px)' }}>
            <table className="w-full text-left border-collapse">
              <thead style={{ position: 'sticky', top: 0, backgroundColor: '#1e3a8a', zIndex: 10, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)' }}>
                <tr>
                  <th className="p-4 border-b border-[var(--border-color)]">Time</th>
                <th className="p-3 border-b border-[var(--border-color)]">Vehicle</th>
                <th className="p-3 border-b border-[var(--border-color)]">Status</th>
                <th className="p-3 border-b border-[var(--border-color)]">Speed (km/h)</th>
                <th className="p-3 border-b border-[var(--border-color)]">RPM</th>
                <th className="p-3 border-b border-[var(--border-color)]">Engine Temp (°C)</th>
                <th className="p-3 border-b border-[var(--border-color)]">Exhaust Temp (°C)</th>
                <th className="p-3 border-b border-[var(--border-color)]">NOx</th>
                <th className="p-3 border-b border-[var(--border-color)]">CO2</th>
                <th className="p-3 border-b border-[var(--border-color)]">Load (%)</th>
                <th className="p-3 border-b border-[var(--border-color)]">Fuel (L/h)</th>
                <th className="p-3 border-b border-[var(--border-color)]">Score</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((row) => (
                <tr key={row.id} id={`log-${row.id}`} className="border-b border-[var(--border-color)] hover:bg-[rgba(255,255,255,0.02)] transition-colors" style={{ transition: 'background-color 0.5s ease' }}>
                  <td className="p-3 data-mono text-muted text-sm whitespace-nowrap">{new Date(row.created_at.replace('Z', '') + 'Z').toLocaleString()}</td>
                  <td className="p-3 data-mono highlight">{row.vehicle_id}</td>
                  <td className="p-3">
                    {row.severity !== 'Normal' ? (
                      <Link to={`/anomalies#alert-${row.id}`} className="hover-link" title="View AI Diagnostics" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span className={`status-badge ${getSeverityBadge(row.severity)}`}>{row.severity}</span>
                        <ExternalLink size={14} className="text-muted" />
                      </Link>
                    ) : (
                      <span className={`status-badge ${getSeverityBadge(row.severity)}`}>{row.severity}</span>
                    )}
                  </td>
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
              {logs.length === 0 && (
                <tr>
                  <td colSpan={12} className="p-4 text-center text-muted">No historical data available.</td>
                </tr>
              )}
            </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
