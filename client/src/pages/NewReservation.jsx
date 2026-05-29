import { useNavigate } from 'react-router-dom';
import { BookingForm } from '../components/reservations/BookingForm';

export default function NewReservation() {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground break-words">New Reservation</h2>
        <p className="text-muted-foreground mt-1">Book equipment for an organization</p>
      </div>
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <BookingForm onSuccess={() => navigate('/reservations')} onCancel={() => navigate(-1)} />
      </div>
    </div>
  );
}
