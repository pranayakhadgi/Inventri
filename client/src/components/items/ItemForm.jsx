import { useState } from 'react';
import { useCreateItem } from '../../hooks/useItems';
import { useLocations } from '../../hooks/useLocations';
import { Button } from '../ui/Button';
import { toast } from 'sonner';

export function ItemForm({ onSuccess, onCancel }) {
  const { data: locationsData } = useLocations();
  const createItem = useCreateItem();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    location_id: '',
    status: 'available',
  });

  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name) {
      setError('Item name is required');
      return;
    }

    try {
      await createItem.mutateAsync({
        ...formData,
        location_id: formData.location_id ? parseInt(formData.location_id, 10) : null,
      });
      toast.success('Item created successfully');
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'Failed to create item');
      toast.error('Failed to create item');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded text-sm">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium text-[var(--text-primary)]">Name *</label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface-0)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
          placeholder="e.g. MacBook Pro M2"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="category" className="text-sm font-medium text-[var(--text-primary)]">Category</label>
        <input
          id="category"
          type="text"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface-0)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
          placeholder="e.g. Laptops"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="location_id" className="text-sm font-medium text-[var(--text-primary)]">Location</label>
        <select
          id="location_id"
          value={formData.location_id}
          onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
          className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface-0)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
        >
          <option value="">Select a location...</option>
          {locationsData?.data?.map((loc) => (
            <option key={loc.location_id} value={loc.location_id}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="status" className="text-sm font-medium text-[var(--text-primary)]">Status</label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface-0)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
        >
          <option value="available">Available</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      <div className="pt-4 flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={createItem.isPending}>
          {createItem.isPending ? 'Creating...' : 'Create Item'}
        </Button>
      </div>
    </form>
  );
}
