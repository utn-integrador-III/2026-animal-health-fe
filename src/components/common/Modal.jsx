import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HiX } from 'react-icons/hi';

/**
 * Base Modal component rendered via React Portal.
 * Traps focus and closes on Escape key or backdrop click.
 *
 * @param {object}  props
 * @param {boolean} props.isOpen         - Controls visibility
 * @param {function} props.onClose       - Callback to close the modal
 * @param {string}  [props.title]        - Modal header title
 * @param {React.ReactNode} props.children
 * @param {string}  [props.maxWidth='max-w-2xl'] - Tailwind max-width class
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-2xl',
}) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll while modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    /* Backdrop */
    <div
      id="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target.id === 'modal-backdrop') onClose();
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className={[
          'relative z-10 w-full rounded-2xl bg-white shadow-2xl',
          'max-h-[90vh] overflow-y-auto',
          maxWidth,
        ].join(' ')}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2
              id="modal-title"
              className="text-lg font-semibold text-gray-800"
            >
              {title}
            </h2>
            <button
              id="modal-close-btn"
              onClick={onClose}
              aria-label="Close modal"
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <HiX className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
