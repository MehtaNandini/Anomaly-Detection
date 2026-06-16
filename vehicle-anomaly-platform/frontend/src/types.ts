export interface Telemetry {
  id: number;
  vehicle_id: string;
  speed: number;
  rpm: number;
  engine_temp: number;
  exhaust_temp: number;
  nox: number;
  co2: number;
  fuel_rate: number;
  engine_load: number;
  anomaly_score: number;
  is_anomaly: boolean;
  severity: string;
  fault_type: string;
  ai_explanation?: string;
  created_at: string;
}

export interface Alert {
  id: number;
  vehicle_id: string;
  severity: string;
  fault_type: string;
  created_at: string;
  ai_explanation?: string;
}
