import { Routes, Route } from 'react-router';
import { MainLayout } from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Reservations from './pages/Reservations';
import NewReservation from './pages/NewReservation';

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/reservations" element={<Reservations />} />
        <Route path="/reservations/new" element={<NewReservation />} />
      </Route>
    </Routes>
  );
}

export default App;