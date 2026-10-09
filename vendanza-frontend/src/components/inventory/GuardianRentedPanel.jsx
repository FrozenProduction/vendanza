import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchInventoryItems, fetchMyRentals } from '../../api/inventory';
import {
  formatRentalDate,
  formatRentalDateTime,
  getTimeUntilReturn,
  rentalStateColor,
  isPendingRental,
  rentalStateLabel,
  RENTAL_STATES,
} from '../../utils/rentalHelpers';
import { formatInventoryPrice, hasInventoryImage } from './inventoryHelpers';

export default function GuardianRentedPanel({ userId, visible }) {
  const [loading, setLoading] = useState(false);
  const [rentals, setRentals] = useState([]);
  const [itemsById, setItemsById] = useState({});

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [myRentals, items] = await Promise.all([
        fetchMyRentals(userId),
        fetchInventoryItems(),
      ]);
      const map = {};
      items.forEach((i) => {
        map[i.id] = i;
      });
      setItemsById(map);
      setRentals(
        [...myRentals].sort(
          (a, b) => new Date(b.dataInicio || 0) - new Date(a.dataInicio || 0),
        ),
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (visible) load();
  }, [visible, load]);

  const enriched = useMemo(
    () =>
      rentals.map((r) => ({
        ...r,
        artefacto: itemsById[r.idArtefacto] || null,
      })),
    [rentals, itemsById],
  );

  const active = enriched.filter(
    (r) => isPendingRental(r.estado) || r.estado === RENTAL_STATES.ACTIVE,
  );
  const history = enriched.filter(
    (r) => r.estado === RENTAL_STATES.DONE || r.estado === RENTAL_STATES.REJECTED,
  );

  if (!visible) return null;

  return (
    <div style={{ position: 'relative', minHeight: 120 }}>
      {loading && (
        <p style={{ textAlign: 'center', color: '#64748b', padding: 24 }}>A carregar alugueres…</p>
      )}

      {!loading && (
        <>
          <p style={{ color: '#666', marginBottom: 20 }}>
            Peças da escola que requisitou. O pagamento é feito presencialmente na secretaria após
            aprovação.
          </p>

          {active.length === 0 && (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem 0' }}>
              Não tem alugueres ativos. Requisite uma peça no catálogo da escola.
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {active.map((r) => {
              const art = r.artefacto;
              const badge = rentalStateColor(r.estado);
              return (
                <article
                  key={r.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: art && hasInventoryImage(art) ? '120px 1fr' : '1fr',
                    gap: 20,
                    padding: 20,
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    background: '#fafbfc',
                  }}
                >
                  {art && hasInventoryImage(art) && (
                    <img
                      src={art.imagem}
                      alt={art.descricao}
                      style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 10 }}
                    />
                  )}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 10,
                        alignItems: 'center',
                        marginBottom: 8,
                      }}
                    >
                      <h3 style={{ margin: 0, fontSize: '1.15rem' }}>
                        {art?.descricao || `Artefacto #${r.idArtefacto}`}
                      </h3>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: 6,
                          background: badge.bg,
                          color: badge.color,
                        }}
                      >
                        {rentalStateLabel(r.estado)}
                      </span>
                    </div>
                    {art && (
                      <p style={{ margin: '0 0 12px', color: '#64748b', fontSize: '0.9rem' }}>
                        {art.categoria} · Tam. {art.tamanho || '—'} ·{' '}
                        {formatInventoryPrice(art.precoAluguer)}
                      </p>
                    )}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                        gap: 12,
                        fontSize: '0.88rem',
                      }}
                    >
                      <div>
                        <strong
                          style={{
                            color: '#94a3b8',
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                          }}
                        >
                          Pedido em
                        </strong>
                        <p style={{ margin: '4px 0 0', fontWeight: 600 }}>
                          {formatRentalDateTime(r.dataInicio)}
                        </p>
                      </div>
                      <div>
                        <strong
                          style={{
                            color: '#94a3b8',
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                          }}
                        >
                          Início
                        </strong>
                        <p style={{ margin: '4px 0 0', fontWeight: 600 }}>
                          {formatRentalDate(r.dataInicio)}
                        </p>
                      </div>
                      <div>
                        <strong
                          style={{
                            color: '#94a3b8',
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                          }}
                        >
                          Fim / entrega
                        </strong>
                        <p style={{ margin: '4px 0 0', fontWeight: 600 }}>
                          {formatRentalDate(r.dataFim)}
                        </p>
                      </div>
                      {r.estado === RENTAL_STATES.ACTIVE && (
                        <div>
                          <strong
                            style={{
                              color: '#94a3b8',
                              fontSize: '0.7rem',
                              textTransform: 'uppercase',
                            }}
                          >
                            Tempo restante
                          </strong>
                          <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#0e7490' }}>
                            {getTimeUntilReturn(r.dataFim)}
                          </p>
                        </div>
                      )}
                    </div>
                    {isPendingRental(r.estado) && (
                      <p style={{ margin: '12px 0 0', fontSize: '0.85rem', color: '#b45309' }}>
                        O pedido está à espera de aprovação da direção.
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {history.length > 0 && (
            <>
              <h3 style={{ marginTop: 32, marginBottom: 16, color: '#64748b' }}>Histórico</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {history.map((r) => {
                  const art = r.artefacto;
                  const badge = rentalStateColor(r.estado);
                  return (
                    <div
                      key={r.id}
                      style={{
                        padding: 16,
                        border: '1px solid #e2e8f0',
                        borderRadius: 10,
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 12,
                        opacity: 0.85,
                      }}
                    >
                      <div>
                        <strong>{art?.descricao || `Artefacto #${r.idArtefacto}`}</strong>
                        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                          {formatRentalDate(r.dataInicio)} — {formatRentalDate(r.dataFim)}
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: 6,
                          background: badge.bg,
                          color: badge.color,
                          alignSelf: 'center',
                        }}
                      >
                        {rentalStateLabel(r.estado)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
