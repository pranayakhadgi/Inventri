import { useState } from 'react';
import { useOrganizations } from '../../hooks/useOrganizations';
import { useItems } from '../../hooks/useItems';
import { useCreateReservation } from '../../hooks/useReservations';
import { Button } from '../ui/Button';
import { toast } from 'sonner';

const inputClass = 'w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring';

export function BookingForm({ onSuccess, onCancel }) {
  const { data: orgsData } = useOrganizations();
  const { data: itemsData } = useItems();
  const createReservation = useCreateReservation();

  const [formData, setFormData] = useState({
    organization_id: '', location_id: '', start_time: '', end_time: '', items: [],
  });
  const [selectedItemId, setSelectedItemId] = useState('');
  const [error, setError] = useState(null);

  const availableItems = itemsData?.data?.filter(i => i.status === 'available') || [];

  const handleAddItem = () => {
    if (!selectedItemId) return;
    const item = availableItems.find(i => i.item_id === parseInt(selectedItemId));
    if (!item) return;
    if (formData.items.some(i => i.item_id === item.item_id)) { toast.error('Item already added'); return; }
    setFormData({ ...formData, items: [...formData.items, { item_id: item.item_id, name: item.name, quantity_requested: 1 }] });
    setSelectedItemId('');
  };

  const handleRemoveItem = (id) => {
    setFormData({ ...formData, items: formData.items.filter(i => i.item_id !== id) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!formData.organization_id || !formData.start_time || !formData.end_time || formData.items.length === 0) {
      setError('Please fill in all required fields and add at least one item'); return;
    }
    if (new Date(formData.start_time) >= new Date(formData.end_time)) {
      setError('End time must be after start time'); return;
    }
    try {
      await createReservation.mutateAsync({
        ...formData,
        organization_id: parseInt(formData.organization_id),
        location_id: formData.location_id ? parseInt(formData.location_id) : null,
      });
      toast.success('Reservation created successfully');
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'Failed to create reservation');
      toast.error('Booking failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm border border-destructive/20">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Organization *</label>
          <select value={formData.organization_id} onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })} className={inputClass} required>
            <option value="">Select an organization...</option>
            {orgsData?.data?.map((org) => <option key={org.organization_id} value={org.organization_id}>{org.name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Location (Optional)</label>
          <select value={formData.location_id} onChange={(e) => setFormData({ ...formData, location_id: e.target.value })} className={inputClass}>
            <option value="">Select location...</option>
            <option value="1">Main Campus</option>
            <option value="2">Science Building</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Start Time *</label>
          <input type="datetime-local" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} className={inputClass} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">End Time *</label>
          <input type="datetime-local" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} className={inputClass} required />
        </div>
      </div>

      <div className="space-y-3 pt-2 border-t border-border">
        <label className="text-sm font-medium text-foreground">Items to Reserve *</label>
        <div className="flex gap-2">
          <select value={selectedItemId} onChange={(e) => setSelectedItemId(e.target.value)} className={inputClass + ' flex-1'}>
            <option value="">Select an available item...</option>
            {availableItems.map((item) => <option key={item.item_id} value={item.item_id}>{item.name} ({item.category})</option>)}
          </select>
          <Button type="button" variant="secondary" onClick={handleAddItem} disabled={!selectedItemId}>Add</Button>
        </div>
        {formData.items.length > 0 && (
          <div className="border border-border rounded-lg overflow-hidden">
            {formData.items.map((item) => (
              <div key={item.item_id} className="flex items-center justify-between gap-3 p-3 bg-card border-b border-border last:border-0">
                <span className="text-sm font-medium text-card-foreground break-words min-w-0">{item.name}</span>
                <button type="button" onClick={() => handleRemoveItem(item.item_id)} className="text-destructive hover:text-destructive/80 text-sm p-1 shrink-0 cursor-pointer">Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-6 flex justify-end gap-3 border-t border-border">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={createReservation.isPending}>{createReservation.isPending ? 'Confirming...' : 'Confirm Booking'}</Button>
      </div>
    </form>
  );
}
