import { USER_TYPES } from '../../api/config';
import Modal, { ModalCloseButton } from '../ui/Modal';
import {
  canRequestEscolaItem,
  formatInventoryPrice,
  hasInventoryImage,
  isEscolaItem,
} from './inventoryHelpers';

const detailRow = { margin: '0 0 12px', color: '#475569', fontSize: '0.95rem', lineHeight: 1.5 };
const detailLabel = { fontWeight: 700, color: '#1e293b' };

export default function InventoryDetailModal({
  item,
  open,
  onClose,
  myId,
  isMyItems,
  userType,
  onEdit,
  onDelete,
  onToggle,
  onRequest,
  onContact,
  rentedArtefactoIds,
}) {
  if (!item) return null;

  const isEscola = isEscolaItem(item);
  const isActive = item.disponibilidade === 'Disponível';
  const escolaRequestable = canRequestEscolaItem(item, rentedArtefactoIds);
  const isMe = item.idEncEducacao === myId || item.idDocente === myId || item.idDirecao === myId;
  const priceText = formatInventoryPrice(item.precoAluguer);

  const handleAction = (fn) => {
    fn(item);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth={560} className="inventory-detail-modal">
      <ModalCloseButton onClose={onClose} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div
          style={{
            borderRadius: 12,
            overflow: 'hidden',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
          }}
        >
          {hasInventoryImage(item) ? (
            <img
              src={item.imagem}
              alt={item.descricao}
              style={{
                width: '100%',
                maxHeight: 360,
                objectFit: 'contain',
                display: 'block',
                background: '#f1f5f9',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                minHeight: 220,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                fontWeight: 'bold',
                fontSize: '1rem',
              }}
            >
              Sem fotografia
            </div>
          )}
        </div>

        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            <span
              style={{
                background: isEscola ? '#00bcd4' : '#10b981',
                color: 'white',
                padding: '4px 12px',
                borderRadius: 6,
                fontSize: '0.75rem',
                fontWeight: 'bold',
              }}
            >
              {isEscola ? 'Escola' : 'Comunidade'}
            </span>
            <span
              style={{
                background: '#f1f5f9',
                color: '#64748b',
                padding: '4px 12px',
                borderRadius: 6,
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              {item.categoria || 'Outros'}
            </span>
            {isMyItems && (
              <span
                style={{
                  background: isActive ? '#dcfce7' : '#f1f5f9',
                  color: isActive ? '#059669' : '#94a3b8',
                  padding: '4px 12px',
                  borderRadius: 6,
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                }}
              >
                {isActive ? 'Ativo' : 'Inativo'}
              </span>
            )}
          </div>

          <h2 style={{ margin: '0 0 8px', color: 'var(--secondary)', fontSize: '1.35rem' }}>
            {item.descricao}
          </h2>
          <p style={{ margin: '0 0 16px', fontSize: '1.25rem', fontWeight: 800, color: isEscola ? 'var(--primary)' : '#f59e0b' }}>
            {priceText}
          </p>

          <div style={{ background: '#f8fafc', borderRadius: 12, padding: '16px 18px', border: '1px solid #e2e8f0' }}>
            <p style={detailRow}>
              <span style={detailLabel}>Tamanho: </span>
              {item.tamanho || 'N/A'}
            </p>
            <p style={detailRow}>
              <span style={detailLabel}>Condição: </span>
              {item.estado || 'Usado'}
            </p>
            <p style={detailRow}>
              <span style={detailLabel}>Disponibilidade: </span>
              {item.disponibilidade || '—'}
            </p>
            {item.telefone && item.telefone !== 'null' && (
              <p style={{ ...detailRow, marginBottom: 0 }}>
                <span style={detailLabel}>Contacto: </span>
                {item.telefone}
              </p>
            )}
          </div>
        </div>

        {isMyItems ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn-primary"
                style={{ flex: 1, padding: 12, background: 'white', color: 'var(--primary)', border: '1px solid var(--primary)' }}
                onClick={() => handleAction(onEdit)}
              >
                Editar
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ flex: 1, padding: 12, background: 'white', color: '#ef4444', border: '1px solid #ef4444' }}
                onClick={() => {
                  onDelete(item.id);
                  onClose();
                }}
              >
                Apagar
              </button>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: '#f8fafc',
                borderRadius: 10,
                border: '1px solid #e2e8f0',
              }}
            >
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: isActive ? '#10b981' : '#94a3b8' }}>
                {isActive ? 'Anúncio ativo no catálogo' : 'Anúncio inativo'}
              </span>
              <label className="toggle-switch">
                <input type="checkbox" checked={isActive} onChange={(e) => onToggle(item, e.target.checked)} />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {isEscola ? (
              <button
                type="button"
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: 12,
                  background: escolaRequestable ? '#00bcd4' : '#e2e8f0',
                  color: escolaRequestable ? 'white' : '#64748b',
                  border: 'none',
                  cursor: escolaRequestable ? 'pointer' : 'not-allowed',
                }}
                disabled={!escolaRequestable}
                onClick={() => escolaRequestable && handleAction(onRequest)}
              >
                {escolaRequestable ? 'Requisitar peça' : 'Peça indisponível (em aluguer)'}
              </button>
            ) : isMe ? (
              <button
                type="button"
                className="btn-primary"
                style={{ width: '100%', padding: 12, background: '#e2e8f0', color: '#64748b', border: 'none', cursor: 'not-allowed' }}
                disabled
              >
                A minha peça
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                style={{ width: '100%', padding: 12, background: 'white', color: '#10b981', border: '2px solid #10b981' }}
                onClick={() => handleAction(onContact)}
              >
                Contactar vendedor
              </button>
            )}
            {userType === USER_TYPES.TEACHER && isEscola && (
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>
                Requisições da escola são feitas pelo encarregado de educação.
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
