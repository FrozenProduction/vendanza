export default function Modal({ open, onClose, children, maxWidth = 500, className = '' }) {
  if (!open) return null;

  return (
    <div className="modal-overlay visible" onClick={onClose} role="presentation">
      <div
        className={`modal-content ${className}`.trim()}
        style={{ maxWidth, padding: 30, background: '#fff' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}

export function ModalCloseButton({ onClose }) {
  return (
    <button
      type="button"
      className="close-btn"
      onClick={onClose}
      aria-label="Fechar"
      style={{ cursor: 'pointer' }}
    >
      ×
    </button>
  );
}
