import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReservations } from '../hooks/useReservations';
import { ReservationTable } from '../components/reservations/ReservationTable';
import { ReservationKanban } from '../components/reservations/ReservationKanban';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { toast } from 'sonner';

export default function Reservations() {
  const { data, isLoading, isError } = useReservations();
  const navigate = useNavigate();
  const [view, setView] = useState('kanban');
  const [selectedRes, setSelectedRes] = useState(null);
  const [filter, setFilter] = useState('all');

  const reservations = data?.data || [];
  const filteredReservations = filter === 'all' ? reservations : reservations.filter(r => r.status === filter);

  if (isError) {
    return <div className="p-8 text-center bg-destructive/10 text-destructive rounded-lg">Failed to load reservations.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex sm:flex-row flex-col items-start sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-foreground break-words">Reservations</h2>
          <p className="text-muted-foreground">Manage bookings and returns</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex bg-muted p-1 rounded-lg border border-border">
            <button onClick={() => setView('kanban')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${view === 'kanban' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Board</button>
            <button onClick={() => setView('table')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${view === 'table' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>List</button>
          </div>
          <Button variant="primary" onClick={() => navigate('/reservations/new')}>+ New Booking</Button>
        </div>
      </div>

      {view === 'table' && (
        <div className="flex gap-2 flex-wrap pb-2">
          {['all', 'pending', 'active', 'completed', 'cancelled'].map(status => (
            <button key={status} onClick={() => setFilter(status)} className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors cursor-pointer ${filter === status ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>{status}</button>
          ))}
        </div>
      )}

      {view === 'kanban' ? (
        <ReservationKanban reservations={reservations} isLoading={isLoading} onCardClick={setSelectedRes} />
      ) : (
        <ReservationTable reservations={filteredReservations} isLoading={isLoading} onRowClick={setSelectedRes} />
      )}

      <Modal title="Reservation Details" open={!!selectedRes} onClose={() => setSelectedRes(null)}>
        {selectedRes && (
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-start mb-2 gap-3">
                <h3 className="font-semibold text-lg text-card-foreground break-words min-w-0">{selectedRes.organization_name}</h3>
                <Badge status={selectedRes.status} />
              </div>
              <p className="text-sm text-muted-foreground">{new Date(selectedRes.start_time).toLocaleString()} — {new Date(selectedRes.end_time).toLocaleString()}</p>
              {selectedRes.location_name && <p className="text-sm text-muted-foreground mt-1">Location: {selectedRes.location_name}</p>}
            </div>
            <div>
              <h4 className="font-medium mb-2 text-sm text-muted-foreground">Items</h4>
              <div className="bg-muted rounded-lg p-3 border border-border">
                {selectedRes.item_names ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedRes.item_names.split(', ').map((name, i) => <li key={i} className="text-sm text-card-foreground">{name}</li>)}
                  </ul>
                ) : <p className="text-sm italic text-muted-foreground">No items attached</p>}
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t border-border">
              <Button variant="ghost" onClick={() => setSelectedRes(null)}>Close</Button>
              {selectedRes.status === 'active' && <Button variant="primary" onClick={() => toast.info('Return processing interface coming soon')}>Process Return</Button>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
