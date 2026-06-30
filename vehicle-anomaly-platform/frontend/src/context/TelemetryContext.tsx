import { createContext, useContext, useEffect, useState, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Telemetry, Alert } from '../types';

interface TelemetryContextType {
  telemetry: Telemetry[];
  alerts: Alert[];
  vehicles: string[];
  isConnected: boolean;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

const getApiBase = () => {
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  }
  return '/api';
};

const getWsUrl = () => {
  if (import.meta.env.DEV) {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    return apiBase.replace(/^http/, 'ws') + '/ws/live';
  }
  return `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/live`;
};

const API_BASE = getApiBase();
const WS_URL = getWsUrl();

export const TelemetryProvider = ({ children }: { children: ReactNode }) => {
  const [telemetry, setTelemetry] = useState<Telemetry[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [vehicles, setVehicles] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Initial fetch
    fetch(`${API_BASE}/telemetry/history`)
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
        
        setTelemetry((prev) => [data, ...prev].slice(0, 1000));
        
        if (data.is_anomaly) {
          const newAlert: Alert = {
            id: data.id,
            vehicle_id: data.vehicle_id,
            severity: data.severity,
            fault_type: data.fault_type,
            created_at: data.created_at,
            ai_explanation: data.ai_explanation
          };
          setAlerts((prev) => [newAlert, ...prev].slice(0, 500));
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

  return (
    <TelemetryContext.Provider value={{ telemetry, alerts, vehicles, isConnected }}>
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetry = () => {
  const context = useContext(TelemetryContext);
  if (context === undefined) {
    throw new Error('useTelemetry must be used within a TelemetryProvider');
  }
  return context;
};
