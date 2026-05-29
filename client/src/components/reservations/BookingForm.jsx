import { useState } from 'react';
import { useOrganizations } from '../../hooks/useOrganizations';
import { useItems } from '../../hooks/useItems';
import { useCreateReservation } from '../../hooks/useReservations';
import { Button } from '../ui/Button';
import { toast } from 'sonner';

export function BookingForm({ onSuccess, onCancel }) {
  const { data: orgsData } = useOrganizations();
  const { data: itemsData } = useItems();
  const createReservation = useCreateReservation();

  const [formData, setFormData] = useState({
    organization_id: '',
    location_id: '',
    start_time: '',
    end_time: '',
    items: [],
  });
  
  const [selectedItemId, setSelectedItemId] = useState('');
  const [error, setError] = useState(null);

  const availableItems = itemsData?.data?.filter(i => i.status === 'available') || [];

  const handleAddItem = () => {
    if (!selectedItemId) return;
    const item = availableItems.find(i => i.item_id === parseInt(selectedItemId));
    if (!item) return;
    
    if (formData.items.some(i => i.item_id === item.item_id)) {
      toast.error('Item already added');
      return;
    }
    
    setFormData({
      ...formData,
      items: [...formData.items, { item_id: item.item_id, name: item.name, quantity_requested: 1 }]
    });
    setSelectedItemId('');
  };

  const handleRemoveItem = (id) => {
    setFormData({
      ...formData,
      items: formData.items.filter(i => i.item_id !== id)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.organization_id || !formData.start_time || !formData.end_time || formData.items.length === 0) {
      setError('Please fill in all required fields and add at least one item');
      return;
    }
    
    // Time validation
    const start = new Date(formData.start_time);
    const end = new Date(formData.end_time);
    
    if (start >= end) {
      setError('End time must be after start time');
      return;
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
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--text-primary)]">Organization *</label>
          <select
            value={formData.organization_id}
            onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}
            className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface-0)] text-[var(--text-primary)]"
            required
          >
            <option value="">Select an organization...</option>
            {orgsData?.data?.map((org) => (
              <option key={org.organization_id} value={org.organization_id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--text-primary)]">Location (Optional)</label>
          <select
            value={formData.location_id}
            onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
            className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface-0)] text-[var(--text-primary)]"
          >
            <option value="">Select location...</option>
            <option value="1">Main Campus</option>
            <option value="2">Science Building</option>
          </select>
        </div>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--text-primary)]">Start Time *</label>
          <input
            type="datetime-local"
            value={formData.start_time}
            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface-0)] text-[var(--text-primary)]"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--text-primary)]">End Time *</label>
          <input
            type="datetime-local"
            value={formData.end_time}
            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface-0)] text-[var(--text-primary)]"
            required
          />
        </div>
      </div>

      {/* Items Section */}
      <div className="space-y-3 pt-2 border-t border-[var(--surface-border)]">
        <label className="text-sm font-medium text-[var(--text-primary)]">Items to Reserve *</label>
        
        <div className="flex gap-2">
          <select
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            className="flex-1 h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface-0)] text-[var(--text-primary)]"
          >
            <option value="">Select an available item...</option>
            {availableItems.map((item) => (
              <option key={item.item_id} value={item.item_id}>
                {item.name} ({item.category})
              </option>
            ))}
          </select>
          <Button type="button" variant="secondary" onClick={handleAddItem} disabled={!selectedItemId}>
            Add
          </Button>
        </div>

        {/* Selected Items List */}
        {formData.items.length > 0 && (
          <div className="border border-[var(--surface-border)] rounded-[var(--radius-md)] overflow-hidden">
            {formData.items.map((item) => (
              <div key={item.item_id} className="flex items-center justify-between p-3 bg-[var(--surface-0)] border-b border-[var(--surface-border)] last:border-0">
                <span className="text-sm font-medium text-[var(--text-primary)]">{item.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.item_id)}
                  className="text-red-500 hover:text-red-700 text-sm p-1"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-6 flex justify-end gap-3 border-t border-[var(--surface-border)]">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={createReservation.isPending}>
          {createReservation.isPending ? 'Confirming...' : 'Confirm Booking'}
        </Button>
      </div>
    </form>
  );
}
