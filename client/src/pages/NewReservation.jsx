import { useNavigate } from 'react-router-dom';
import { BookingForm } from '../components/reservations/BookingForm';

export default function NewReservation() {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in">
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">New Reservation</h2>
        <p className="text-[var(--text-secondary)] mt-1">Book equipment for an organization</p>
      </div>

      <div className="bg-[var(--surface-0)] border border-[var(--surface-border)] rounded-[var(--radius-lg)] p-6 shadow-sm">
        <BookingForm 
          onSuccess={() => navigate('/reservations')} 
          onCancel={() => navigate(-1)} 
        />
      </div>
    </div>
  );
}
