import { useEffect, useRef } from 'react';
import clsx from 'clsx';

export function Modal({ open, onClose, title, children, className }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) dialog.showModal();
    else dialog.close();
  }, [open]);

  function handleBackdropClick(e) {
    if (e.target === dialogRef.current) onClose?.();
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      onClick={handleBackdropClick}
      className={clsx(
        'backdrop:bg-black/40 backdrop:backdrop-blur-sm',
        'bg-card text-card-foreground',
        'rounded-xl shadow-xl border border-border',
        'p-0 w-full max-w-lg',
        'scale-in',
        className
      )}
    >
      {title && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold break-words whitespace-normal min-w-0">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
    </dialog>
  );
}
