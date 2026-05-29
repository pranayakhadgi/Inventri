import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReservations, useReturnItems } from '../hooks/useReservations';
import { ReservationTable } from '../components/reservations/ReservationTable';
import { ReservationKanban } from '../components/reservations/ReservationKanban';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { toast } from 'sonner';

export default function Reservations() {
  const { data, isLoading, isError } = useReservations();
  const returnItems = useReturnItems();
  const navigate = useNavigate();

  const [view, setView] = useState('kanban'); // 'table' or 'kanban'
  const [selectedRes, setSelectedRes] = useState(null);
  const [filter, setFilter] = useState('all');

  const reservations = data?.data || [];
  const filteredReservations = filter === 'all' 
    ? reservations 
    : reservations.filter(r => r.status === filter);

  if (isError) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-600 rounded-lg">
        Failed to load reservations. Please try again.
      </div>
    );
  }

  const handleReturn = async (reservation) => {
    if (!window.confirm('Process return for all items in this reservation?')) return;
    
    // In a real app we'd show a form to specify returned quantities
    // For now we'll do a simple mock return of everything requested
    // Note: The API requires items with reservation_item_id and quantity_returned
    toast.info('Return processing interface would open here');
  };

  return (
    <div className="space-y-6">
      <div className="flex sm:flex-row flex-col items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Reservations</h2>
          <p className="text-[var(--text-secondary)]">Manage bookings and returns</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-[var(--surface-2)] p-1 rounded-[var(--radius-md)] border border-[var(--surface-border)]">
            <button
              onClick={() => setView('kanban')}
              className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${view === 'kanban' ? 'bg-[var(--surface-0)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              Board
            </button>
            <button
              onClick={() => setView('table')}
              className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${view === 'table' ? 'bg-[var(--surface-0)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              List
            </button>
          </div>
          <Button variant="primary" onClick={() => navigate('/reservations/new')}>
            + New Booking
          </Button>
        </div>
      </div>

      {view === 'table' && (
        <div className="flex gap-2 pb-2">
          {['all', 'pending', 'active', 'completed', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${filter === status ? 'bg-[var(--color-primary-600)] text-white' : 'bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)]'}`}
            >
              {status}
            </button>
          ))}
        </div>
      )}

      {view === 'kanban' ? (
        <ReservationKanban 
          reservations={reservations} 
          isLoading={isLoading} 
          onCardClick={setSelectedRes} 
        />
      ) : (
        <ReservationTable 
          reservations={filteredReservations} 
          isLoading={isLoading} 
          onRowClick={setSelectedRes} 
        />
      )}

      <Modal
        title={`Reservation Details`}
        open={!!selectedRes}
        onClose={() => setSelectedRes(null)}
      >
        {selectedRes && (
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{selectedRes.organization_name}</h3>
                <Badge status={selectedRes.status} />
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                {new Date(selectedRes.start_time).toLocaleString()} — {new Date(selectedRes.end_time).toLocaleString()}
              </p>
              {selectedRes.location_name && (
                <p className="text-sm text-[var(--text-secondary)] mt-1">Location: {selectedRes.location_name}</p>
              )}
            </div>

            <div>
              <h4 className="font-medium mb-2 text-sm text-[var(--text-secondary)]">Items</h4>
              <div className="bg-[var(--surface-1)] rounded-[var(--radius-md)] p-3 border border-[var(--surface-border)]">
                {selectedRes.item_names ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedRes.item_names.split(', ').map((name, i) => (
                      <li key={i} className="text-sm">{name}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm italic text-[var(--text-muted)]">No items attached</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-[var(--surface-border)]">
              <Button variant="ghost" onClick={() => setSelectedRes(null)}>Close</Button>
              {selectedRes.status === 'active' && (
                <Button variant="primary" onClick={() => handleReturn(selectedRes)}>
                  Process Return
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
