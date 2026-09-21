import Modal from '../ui/Modal';

export default function ClassInfoModal({
  open,
  onClose,
  classInfo,
  statusText,
  buttonLabel,
  buttonDisabled,
  buttonStyle,
  onAction,
  processing,
  readOnly = false,
}) {
  if (!classInfo) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <button
        type="button"
        className="close-btn"
        onClick={onClose}
        style={{ cursor: 'pointer', float: 'right', fontSize: '1.5rem', border: 'none', background: 'none' }}
      >
        ×
      </button>
      <h2 style={{ marginTop: 0, color: 'var(--secondary)' }}>{classInfo.title}</h2>
      <div className="modal-subtitle">{classInfo.teacher}</div>
      <hr style={{ margin: '15px 0', border: 0, borderTop: '1px solid #eee' }} />
      <div className="modal-details">
        <p>
          <strong>Horário:</strong> {classInfo.time}
        </p>
        <p>
          <strong>Estúdio:</strong> {classInfo.studio}
        </p>
        {!readOnly && statusText && (
          <p>
            <strong>Estado:</strong>{' '}
            <span style={{ fontWeight: 'bold', color: statusText.color }}>{statusText.text}</span>
          </p>
        )}
      </div>
      {!readOnly && buttonLabel && (
        <button
          type="button"
          className="btn-primary"
          style={{ width: '100%', marginTop: 15, ...buttonStyle }}
          disabled={buttonDisabled || processing}
          onClick={onAction}
        >
          {processing ? 'A processar...' : buttonLabel}
        </button>
      )}
    </Modal>
  );
}
