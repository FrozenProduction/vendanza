import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Modal, { ModalCloseButton } from '../components/ui/Modal';

const NotificationContext = createContext(null);

const VARIANT_STYLES = {
  success: { icon: '✓', color: '#059669', bg: '#ecfdf5' },
  error: { icon: '✕', color: '#dc2626', bg: '#fef2f2' },
  warning: { icon: '!', color: '#d97706', bg: '#fffbeb' },
  info: { icon: 'ℹ', color: '#0369a1', bg: '#f0f9ff' },
};

export function NotificationProvider({ children }) {
  const [alertState, setAlertState] = useState(null);
  const [confirmState, setConfirmState] = useState(null);
  const [promptState, setPromptState] = useState(null);

  const notify = useCallback(
    ({ message, title = 'Aviso', variant = 'info' }) =>
      new Promise((resolve) => {
        setAlertState({ message, title, variant, resolve });
      }),
    [],
  );

  const confirm = useCallback(
    ({
      message,
      title = 'Confirmar',
      confirmLabel = 'Confirmar',
      cancelLabel = 'Cancelar',
      danger = false,
    }) =>
      new Promise((resolve) => {
        setConfirmState({ message, title, confirmLabel, cancelLabel, danger, resolve });
      }),
    [],
  );

  const prompt = useCallback(
    ({ message, title = 'Indique o motivo', placeholder = '', required = true }) =>
      new Promise((resolve) => {
        setPromptState({ message, title, placeholder, required, value: '', resolve });
      }),
    [],
  );

  const closeAlert = () => {
    alertState?.resolve?.();
    setAlertState(null);
  };

  const closeConfirm = (result) => {
    confirmState?.resolve?.(result);
    setConfirmState(null);
  };

  const closePrompt = (result) => {
    promptState?.resolve?.(result);
    setPromptState(null);
  };

  const value = useMemo(() => ({ notify, confirm, prompt }), [notify, confirm, prompt]);

  const alertVariant = alertState ? VARIANT_STYLES[alertState.variant] || VARIANT_STYLES.info : null;

  return (
    <NotificationContext.Provider value={value}>
      {children}

      <Modal open={!!alertState} onClose={closeAlert} maxWidth={420}>
        {alertState && (
          <>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: alertVariant.bg,
                color: alertVariant.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                fontWeight: 'bold',
                margin: '0 auto 16px',
              }}
            >
              {alertVariant.icon}
            </div>
            <h2 style={{ margin: '0 0 10px', textAlign: 'center', color: 'var(--secondary)', fontSize: '1.15rem' }}>
              {alertState.title}
            </h2>
            <p style={{ margin: '0 0 24px', textAlign: 'center', color: '#64748b', lineHeight: 1.5, fontSize: '0.95rem' }}>
              {alertState.message}
            </p>
            <button type="button" className="btn-primary" style={{ width: '100%', padding: 12 }} onClick={closeAlert}>
              OK
            </button>
          </>
        )}
      </Modal>

      <Modal open={!!confirmState} onClose={() => closeConfirm(false)} maxWidth={440}>
        {confirmState && (
          <>
            <h2 style={{ margin: '0 0 12px', color: 'var(--secondary)', fontSize: '1.15rem' }}>
              {confirmState.title}
            </h2>
            <p style={{ margin: '0 0 24px', color: '#64748b', lineHeight: 1.5, fontSize: '0.95rem' }}>
              {confirmState.message}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn-primary"
                style={{ flex: 1, background: 'white', color: '#64748b', border: '1px solid #cbd5e1', padding: 12 }}
                onClick={() => closeConfirm(false)}
              >
                {confirmState.cancelLabel}
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{
                  flex: 1,
                  padding: 12,
                  background: confirmState.danger ? '#ef4444' : undefined,
                }}
                onClick={() => closeConfirm(true)}
              >
                {confirmState.confirmLabel}
              </button>
            </div>
          </>
        )}
      </Modal>

      <Modal open={!!promptState} onClose={() => closePrompt(null)} maxWidth={460}>
        {promptState && (
          <>
            <ModalCloseButton onClose={() => closePrompt(null)} />
            <h2 style={{ margin: '0 0 10px', color: 'var(--secondary)', fontSize: '1.15rem' }}>
              {promptState.title}
            </h2>
            <p style={{ margin: '0 0 16px', color: '#64748b', lineHeight: 1.5, fontSize: '0.9rem' }}>
              {promptState.message}
            </p>
            <textarea
              value={promptState.value}
              onChange={(e) =>
                setPromptState((prev) => (prev ? { ...prev, value: e.target.value } : prev))
              }
              placeholder={promptState.placeholder}
              rows={4}
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontFamily: 'inherit',
                marginBottom: 20,
                resize: 'vertical',
              }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn-primary"
                style={{ flex: 1, background: 'white', color: '#64748b', border: '1px solid #cbd5e1', padding: 12 }}
                onClick={() => closePrompt(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ flex: 1, padding: 12 }}
                onClick={() => {
                  const trimmed = promptState.value.trim();
                  if (promptState.required && !trimmed) return;
                  closePrompt(trimmed || null);
                }}
              >
                Confirmar
              </button>
            </div>
          </>
        )}
      </Modal>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return ctx;
}
