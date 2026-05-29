import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useDeleteItem } from '../../hooks/useItems';
import { toast } from 'sonner';

export function ItemSheet({ item, open, onClose }) {
  const sheetRef = useRef(null);
  const deleteItem = useDeleteItem();

  useEffect(() => {
    const dialog = sheetRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  function handleBackdropClick(e) {
    if (e.target === sheetRef.current) {
      onClose?.();
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${item.name}?`)) return;

    try {
      await deleteItem.mutateAsync(item.item_id);
      toast.success('Item deleted successfully');
      onClose?.();
    } catch (err) {
      toast.error(err.message || 'Failed to delete item');
    }
  };

  if (!item) return null;

  return (
    <dialog
      ref={sheetRef}
      onCancel={onClose}
      onClick={handleBackdropClick}
      className={clsx(
        'backdrop:bg-black/40 backdrop:backdrop-blur-sm',
        'bg-[var(--surface-0)] text-[var(--text-primary)]',
        'fixed inset-y-0 right-0 m-0 h-full max-h-none w-full max-w-md',
        'border-l border-[var(--surface-border)] shadow-[-10px_0_30px_rgba(0,0,0,0.1)]',
        'slide-in-right p-0',
        'open:animate-in open:slide-in-from-right-full duration-300'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--surface-border)]">
          <h2 className="text-lg font-semibold truncate pr-4">{item.name}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] hover:bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          {/* Image placeholder */}
          <div className="aspect-video w-full rounded-[var(--radius-md)] bg-[var(--surface-2)] flex items-center justify-center border border-[var(--surface-border)]">
            {item.image_url ? (
              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-[var(--radius-md)]" />
            ) : (
              <span className="text-[var(--text-muted)]">No Image</span>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-[var(--text-primary)] border-b border-[var(--surface-border)] pb-2">
              Details
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[var(--text-secondary)] mb-1">Status</p>
                <Badge status={item.status} />
              </div>
              <div>
                <p className="text-[var(--text-secondary)] mb-1">Category</p>
                <p className="font-medium capitalize">{item.category || '—'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[var(--text-secondary)] mb-1">Location</p>
                <p className="font-medium">{item.location_name || '—'}</p>
                {item.location_type && (
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 capitalize">{item.location_type}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[var(--surface-border)] bg-[var(--surface-1)] flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => toast.info('Edit mode coming soon')}>
            Edit Item
          </Button>
          <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={deleteItem.isPending}>
            {deleteItem.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
