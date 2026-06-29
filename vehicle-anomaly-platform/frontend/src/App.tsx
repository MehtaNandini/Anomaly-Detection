import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AnomalyLogs from './pages/AnomalyLogs';
import FleetView from './pages/FleetView';
import VehicleDetail from './pages/VehicleDetail';
import HistoryLogs from './pages/HistoryLogs';
import './index.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="anomalies" element={<AnomalyLogs />} />
        <Route path="vehicles" element={<FleetView />} />
        <Route path="vehicle/:id" element={<VehicleDetail />} />
        <Route path="history" element={<HistoryLogs />} />
      </Route>
    </Routes>
  );
}

export default App;
