import { Routes, Route } from 'react-router';
import { MainLayout } from './components/MainLayout';

const Dashboard = () => <div>Dashboard</div>//the calender goes here later
const Inventory = () => <div>Inventory</div>//the inventory grid goes here
const Reservations = () => <div>Reservations</div>//the reservation table goes here


function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/reservations" element={<Reservations />} />
      </Route>
    </Routes>
  );
}

export default App;