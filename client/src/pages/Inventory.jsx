import { useState } from 'react';
import { useItems } from '../hooks/useItems';
import { ItemTable } from '../components/items/ItemTable';
import { ItemSheet } from '../components/items/ItemSheet';
import { ItemForm } from '../components/items/ItemForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';

export default function Inventory() {
  const { data, isLoading, isError } = useItems();
  const [selectedItem, setSelectedItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const items = data?.data || [];
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isError) {
    return (
      <div className="p-8 text-center bg-destructive/10 text-destructive rounded-lg">
        Failed to load inventory. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex sm:flex-row flex-col items-start sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-foreground break-words">Inventory</h2>
          <p className="text-muted-foreground">Manage all campus equipment</p>
        </div>
        <Button variant="primary" onClick={() => setIsFormOpen(true)} className="shrink-0">+ Add Item</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 max-w-md h-10 px-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <ItemTable items={filteredItems} isLoading={isLoading} onRowClick={(item) => setSelectedItem(item)} />
      <ItemSheet item={selectedItem} open={!!selectedItem} onClose={() => setSelectedItem(null)} />
      <Modal title="Add New Item" open={isFormOpen} onClose={() => setIsFormOpen(false)}>
        <ItemForm onSuccess={() => setIsFormOpen(false)} onCancel={() => setIsFormOpen(false)} />
      </Modal>
    </div>
  );
}
