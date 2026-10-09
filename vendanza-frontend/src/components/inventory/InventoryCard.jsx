import {
  canRequestEscolaItem,
  formatInventoryPrice,
  hasInventoryImage,
  isEscolaItem,
} from './inventoryHelpers';

const clickableStyle = {
  cursor: 'pointer',
  transition: 'opacity 0.15s ease',
};

export default function InventoryCard({
  item,
  myId,
  isMyItems,
  onEdit,
  onDelete,
  onToggle,
  onRequest,
  onContact,
  onViewDetails,
  rentedArtefactoIds,
}) {
  const isActive = item.disponibilidade === 'Disponível';
  const isEscola = isEscolaItem(item);
  const escolaRequestable = canRequestEscolaItem(item, rentedArtefactoIds);
  const isMe = item.idEncEducacao === myId || item.idDocente === myId || item.idDirecao === myId;
  const priceText = formatInventoryPrice(item.precoAluguer);

  const cardOpacity = isMyItems && !isActive ? 0.6 : 1;
  const cardBorder = isMyItems && isActive ? '#f59e0b' : '#e2e8f0';

  const openDetails = () => onViewDetails?.(item);

  const stop = (e) => e.stopPropagation();

  return (
    <div
      style={{
        border: `2px solid ${cardBorder}`,
        borderRadius: 12,
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        background: 'white',
        overflow: 'hidden',
        position: 'relative',
        opacity: cardOpacity,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={openDetails}
        onKeyDown={(e) => e.key === 'Enter' && openDetails()}
        style={clickableStyle}
        title="Ver detalhes da peça"
      >
        {hasInventoryImage(item) ? (
          <img src={item.imagem} alt={item.descricao} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
        ) : (
          <div
            style={{
              width: '100%',
              height: 200,
              background: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              fontWeight: 'bold',
            }}
          >
            Sem Foto
          </div>
        )}
      </div>
      <span
        style={{
          background: isEscola ? '#00bcd4' : '#10b981',
          color: 'white',
          padding: '4px 10px',
          borderRadius: 6,
          fontSize: '0.75rem',
          fontWeight: 'bold',
          position: 'absolute',
          top: 10,
          right: 10,
          pointerEvents: 'none',
        }}
      >
        {isEscola ? 'Escola' : 'Comunidade'}
      </span>
      <div
        role="button"
        tabIndex={0}
        onClick={openDetails}
        onKeyDown={(e) => e.key === 'Enter' && openDetails()}
        style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', ...clickableStyle }}
        title="Ver detalhes da peça"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>
            {item.categoria || 'Outros'}
          </span>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{item.estado || 'Usado'}</span>
        </div>
        <div style={{ height: '3.2rem', overflow: 'hidden' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--secondary)' }}>{item.descricao}</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Tam: {item.tamanho || 'N/A'}</p>
        </div>
        <div style={{ marginTop: 'auto' }}>
          <h4 style={{ margin: '10px 0 0', color: isEscola ? 'var(--primary)' : '#f59e0b' }}>{priceText}</h4>
        </div>
      </div>
      <div style={{ padding: '0 20px 20px' }} onClick={stop} onKeyDown={stop} role="presentation">
        {isMyItems ? (
          <>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="btn-primary"
                style={{ flex: 1, padding: 10, background: 'white', color: 'var(--primary)', border: '1px solid var(--primary)' }}
                onClick={() => onEdit(item)}
              >
                Editar
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ flex: 1, padding: 10, background: 'white', color: '#ef4444', border: '1px solid #ef4444' }}
                onClick={() => onDelete(item.id)}
              >
                Apagar
              </button>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 15,
                paddingTop: 15,
                borderTop: '1px solid #f1f5f9',
              }}
            >
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: isActive ? '#10b981' : '#94a3b8' }}>
                {isActive ? 'Ativo' : 'Inativo'}
              </span>
              <label className="toggle-switch">
                <input type="checkbox" checked={isActive} onChange={(e) => onToggle(item, e.target.checked)} />
                <span className="toggle-slider" />
              </label>
            </div>
          </>
        ) : (
          <div>
            {isEscola ? (
              <button
                type="button"
                className="btn-primary"
                style={{
                  width: '100%',
                  background: escolaRequestable ? '#00bcd4' : '#e2e8f0',
                  color: escolaRequestable ? 'white' : '#64748b',
                  border: 'none',
                  cursor: escolaRequestable ? 'pointer' : 'not-allowed',
                }}
                disabled={!escolaRequestable}
                onClick={() => escolaRequestable && onRequest(item)}
              >
                {escolaRequestable ? 'Requisitar' : 'Indisponível'}
              </button>
            ) : isMe ? (
              <button
                type="button"
                className="btn-primary"
                style={{ width: '100%', background: '#e2e8f0', color: '#64748b', border: 'none', cursor: 'not-allowed' }}
                disabled
              >
                A Minha Peça
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                style={{ width: '100%', background: 'white', color: '#10b981', border: '2px solid #10b981' }}
                onClick={() => onContact(item)}
              >
                Contactar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
