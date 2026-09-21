import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getUserId, getUserType } from '../../../api/auth';
import { USER_TYPES } from '../../../api/config';
import {
  createInventoryItem,
  deleteInventoryItem,
  fetchActiveRentals,
  fetchInventoryItems,
  fileToBase64,
  submitRentalRequest,
  updateInventoryItem,
} from '../../../api/inventory';
import InventoryCard from '../../../components/inventory/InventoryCard';
import GuardianRentedPanel from '../../../components/inventory/GuardianRentedPanel';
import InventoryDetailModal from '../../../components/inventory/InventoryDetailModal';
import { isEscolaItem, isVisibleInGeneralCatalog } from '../../../components/inventory/inventoryHelpers';
import Modal, { ModalCloseButton } from '../../../components/ui/Modal';
import LoadingOverlay from '../../../components/ui/LoadingOverlay';
import { useNotification } from '../../../context/NotificationContext';

const EMPTY_FORM = {
  descricao: '',
  tamanho: '',
  categoria: 'Figurino',
  estado: 'Usado',
  precoAluguer: '',
  telefone: '',
  imagemFile: null,
};

export default function GuardianInventory() {
  const { user } = useAuth();
  const userId = getUserId(user);
  const userType = getUserType(user);
  const { notify } = useNotification();

  const [items, setItems] = useState([]);
  const [rentedArtefactoIds, setRentedArtefactoIds] = useState(() => new Set());
  const [loading, setLoading] = useState(true);
  const isGuardian = userType === USER_TYPES.GUARDIAN;
  const [tab, setTab] = useState('todos');
  const [filterCategory, setFilterCategory] = useState('todos');
  const [filterOrigin, setFilterOrigin] = useState('todos');
  const [filterPriceMin, setFilterPriceMin] = useState('');
  const [filterPriceMax, setFilterPriceMax] = useState('');

  const [itemModal, setItemModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [deleteId, setDeleteId] = useState(null);
  const [contactItem, setContactItem] = useState(null);
  const [rentItem, setRentItem] = useState(null);
  const [rentDates, setRentDates] = useState({ inicio: '', fim: '', observacoes: '' });
  const [successModal, setSuccessModal] = useState(false);
  const [professorBlock, setProfessorBlock] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  const rentMaxFim = useMemo(() => {
    if (!rentDates.inicio) return undefined;
    const max = new Date(rentDates.inicio);
    max.setFullYear(max.getFullYear() + 1);
    return max.toISOString().split('T')[0];
  }, [rentDates.inicio]);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const [data, activeRentals] = await Promise.all([
        fetchInventoryItems(),
        fetchActiveRentals().catch(() => []),
      ]);
      setItems(data);
      setRentedArtefactoIds(
        new Set(activeRentals.map((r) => r.idArtefacto).filter((id) => id != null)),
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    if (!isGuardian && tab === 'alugados') setTab('todos');
  }, [isGuardian, tab]);

  const marketplaceItems = useMemo(() => {
    const minP = parseFloat(filterPriceMin) || 0;
    const maxP = parseFloat(filterPriceMax) || 999999;
    return items.filter((i) => {
      const isEscola = isEscolaItem(i);
      if (!isVisibleInGeneralCatalog(i, rentedArtefactoIds)) return false;
      if (filterCategory !== 'todos' && i.categoria !== filterCategory) return false;
      if (i.precoAluguer < minP || i.precoAluguer > maxP) return false;
      if (filterOrigin === 'escola' && !isEscola) return false;
      if (filterOrigin === 'comunidade' && isEscola) return false;
      if (filterOrigin === 'gratis' && i.precoAluguer > 0) return false;
      return true;
    });
  }, [items, rentedArtefactoIds, filterCategory, filterOrigin, filterPriceMin, filterPriceMax]);

  const myItems = useMemo(
    () => items.filter((i) => i.idEncEducacao === userId || i.idDocente === userId || i.idDirecao === userId),
    [items, userId],
  );

  const openNewItem = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setItemModal(true);
  };

  const openEditItem = (item) => {
    setEditId(item.id);
    setForm({
      descricao: item.descricao,
      tamanho: item.tamanho,
      categoria: item.categoria,
      estado: item.estado,
      precoAluguer: String(item.precoAluguer),
      telefone: item.telefone || '',
      imagemFile: null,
    });
    setItemModal(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!userId) {
      await notify({ title: 'Sessão expirada', message: 'A sua sessão expirou.', variant: 'error' });
      return;
    }
    if (form.telefone.length !== 9) {
      await notify({ title: 'Aviso', message: 'O telemóvel deve ter 9 dígitos.', variant: 'warning' });
      return;
    }

    let imgBase64 = '';
    if (form.imagemFile) {
      if (form.imagemFile.size > 2000000) {
        await notify({
          title: 'Aviso',
          message: 'Imagem demasiado grande (max 2MB).',
          variant: 'warning',
        });
        return;
      }
      imgBase64 = await fileToBase64(form.imagemFile);
    } else if (!editId) {
      await notify({
        title: 'Aviso',
        message: 'A fotografia é obrigatória para um novo anúncio.',
        variant: 'warning',
      });
      return;
    }

    const payload = {
      descricao: form.descricao,
      tamanho: form.tamanho,
      categoria: form.categoria,
      estado: form.estado,
      precoAluguer: parseFloat(form.precoAluguer) || 0,
      disponibilidade: 'Disponível',
      telefone: form.telefone,
      idDocente: userType === USER_TYPES.TEACHER ? userId : null,
      idEncEducacao: userType === USER_TYPES.GUARDIAN ? userId : null,
      idDirecao: userType === USER_TYPES.ADMIN ? userId : null,
    };
    if (imgBase64) payload.imagem = imgBase64;

    try {
      if (editId) await updateInventoryItem(editId, payload);
      else await createInventoryItem(payload);
      await notify({
        title: 'Sucesso',
        message: editId ? 'Anúncio atualizado!' : 'Anúncio publicado!',
        variant: 'success',
      });
      setItemModal(false);
      loadItems();
    } catch (err) {
      await notify({ title: 'Erro', message: `Erro: ${err.message}`, variant: 'error' });
    }
  };

  const handleToggle = async (item, checked) => {
    try {
      await updateInventoryItem(item.id, {
        ...item,
        disponibilidade: checked ? 'Disponível' : 'Indisponível',
      });
      loadItems();
    } catch {
      await notify({ title: 'Erro', message: 'Erro ao mudar estado.', variant: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteInventoryItem(deleteId);
      setDeleteId(null);
      loadItems();
    } catch {
      await notify({ title: 'Erro', message: 'Erro ao apagar.', variant: 'error' });
    }
  };

  const handleRequest = (item) => {
    if (userType === USER_TYPES.TEACHER) {
      setProfessorBlock(true);
      return;
    }
    setRentItem(item);
    setRentDates({ inicio: '', fim: '', observacoes: '' });
  };

  const submitRentRequest = async (e) => {
    e.preventDefault();
    if (!rentDates.inicio || !rentDates.fim) {
      await notify({
        title: 'Aviso',
        message: 'Preencha as datas de início e fim.',
        variant: 'warning',
      });
      return;
    }
    if (!rentItem || !userId) return;
    try {
      await submitRentalRequest({
        dataInicio: `${rentDates.inicio}T00:00:00`,
        dataFim: `${rentDates.fim}T23:59:59`,
        valor: rentItem.precoAluguer,
        idArtefacto: rentItem.id,
        idEncEducacao: userId,
      });
      setRentItem(null);
      setSuccessModal(true);
      if (isGuardian) setTab('alugados');
      loadItems();
    } catch (err) {
      await notify({ title: 'Erro', message: err.message || 'Erro ao enviar pedido.', variant: 'error' });
    }
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 20,
  };

  return (
    <section className="section-view active">
      <LoadingOverlay visible={loading} />
      <div className="card">
        <h2>Marketplace e Inventário</h2>
        <p style={{ color: '#666', marginBottom: 20 }}>
          Requisite peças da escola ou partilhe as suas com a comunidade.
        </p>

        <div style={{ display: 'flex', gap: 15, marginBottom: 25, borderBottom: '2px solid #f1f5f9', paddingBottom: 20 }}>
          <button type="button" className={`inv-tab-btn${tab === 'todos' ? ' active' : ''}`} onClick={() => setTab('todos')}>
            Ver Catálogo Geral
          </button>
          <button type="button" className={`inv-tab-btn${tab === 'meus' ? ' active' : ''}`} onClick={() => setTab('meus')}>
            As Minhas Peças
          </button>
          {isGuardian && (
            <button
              type="button"
              className={`inv-tab-btn${tab === 'alugados' ? ' active' : ''}`}
              onClick={() => setTab('alugados')}
            >
              Alugados
            </button>
          )}
        </div>

        {tab === 'todos' && (
          <>
            <div
              style={{
                background: '#f8fafc',
                padding: 20,
                borderRadius: 12,
                marginBottom: 25,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 20,
                alignItems: 'flex-end',
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ flex: 1, minWidth: 150 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>CATEGORIA</label>
                <select className="form-control" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ width: '100%', padding: 10, marginTop: 8 }}>
                  <option value="todos">Todas</option>
                  <option value="Figurino">Figurinos</option>
                  <option value="Acessório">Acessórios</option>
                  <option value="Cenário">Cenários</option>
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 150 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>ORIGEM</label>
                <select className="form-control" value={filterOrigin} onChange={(e) => setFilterOrigin(e.target.value)} style={{ width: '100%', padding: 10, marginTop: 8 }}>
                  <option value="todos">Qualquer</option>
                  <option value="escola">Escola</option>
                  <option value="comunidade">Comunidade</option>
                  <option value="gratis">Apenas Gratuitas</option>
                </select>
              </div>
              <div style={{ flex: 1.5, minWidth: 250 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>INTERVALO DE PREÇO (EUR)</label>
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <input type="number" placeholder="Min." min={0} value={filterPriceMin} onChange={(e) => setFilterPriceMin(e.target.value)} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #cbd5e1' }} />
                  <span>-</span>
                  <input type="number" placeholder="Max." min={0} value={filterPriceMax} onChange={(e) => setFilterPriceMax(e.target.value)} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #cbd5e1' }} />
                </div>
              </div>
            </div>
            <div style={gridStyle}>
              {marketplaceItems.map((item) => (
                <InventoryCard
                  key={item.id}
                  item={item}
                  myId={userId}
                  isMyItems={false}
                  onEdit={openEditItem}
                  onDelete={setDeleteId}
                  onToggle={handleToggle}
                  onRequest={handleRequest}
                  onContact={setContactItem}
                  onViewDetails={setDetailItem}
                  rentedArtefactoIds={rentedArtefactoIds}
                />
              ))}
            </div>
          </>
        )}

        {isGuardian && tab === 'alugados' && <GuardianRentedPanel userId={userId} visible />}

        {tab === 'meus' && (
          <>
            <button type="button" className="btn-primary" style={{ marginBottom: 25, background: '#10b981', border: 'none', padding: '12px 24px' }} onClick={openNewItem}>
              Publicar Nova Peça
            </button>
            <div style={gridStyle}>
              {myItems.length === 0 ? (
                <p style={{ color: '#666', gridColumn: '1 / -1', textAlign: 'center', padding: 30 }}>
                  Ainda não publicou nenhuma peça.
                </p>
              ) : (
                myItems.map((item) => (
                  <InventoryCard
                    key={item.id}
                    item={item}
                    myId={userId}
                    isMyItems
                    onEdit={openEditItem}
                    onDelete={setDeleteId}
                    onToggle={handleToggle}
                    onRequest={handleRequest}
                    onContact={setContactItem}
                    onViewDetails={setDetailItem}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>

      <InventoryDetailModal
        item={detailItem}
        open={Boolean(detailItem)}
        onClose={() => setDetailItem(null)}
        myId={userId}
        isMyItems={
          Boolean(detailItem) &&
          (detailItem.idEncEducacao === userId ||
            detailItem.idDocente === userId ||
            detailItem.idDirecao === userId)
        }
        userType={userType}
        onEdit={openEditItem}
        onDelete={setDeleteId}
        onToggle={handleToggle}
        onRequest={handleRequest}
        onContact={setContactItem}
        rentedArtefactoIds={rentedArtefactoIds}
      />

      <Modal open={itemModal} onClose={() => setItemModal(false)} maxWidth={500}>
        <ModalCloseButton onClose={() => setItemModal(false)} />
        <h2 style={{ marginTop: 0, color: 'var(--secondary)' }}>{editId ? 'Editar Peça' : 'Publicar Peça'}</h2>
        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: 20 }}>
          Preencha os detalhes do artigo para o Marketplace.
        </p>
        <form onSubmit={handleSaveItem}>
          <div className="form-group" style={{ marginBottom: 15 }}>
            <label>Nome da Peça *</label>
            <input type="text" required value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} style={{ width: '100%', padding: 10 }} />
          </div>
          <div style={{ display: 'flex', gap: 15, marginBottom: 15 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Categoria *</label>
              <select required value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} style={{ width: '100%', padding: 10 }}>
                <option>Figurino</option>
                <option>Acessório</option>
                <option>Cenário</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Condição *</label>
              <select required value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} style={{ width: '100%', padding: 10 }}>
                <option>Novo</option>
                <option>Como Novo</option>
                <option>Bom Estado</option>
                <option>Usado</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 15, marginBottom: 15 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Tamanho *</label>
              <input type="text" required value={form.tamanho} onChange={(e) => setForm({ ...form, tamanho: e.target.value })} style={{ width: '100%', padding: 10 }} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Preço (EUR) *</label>
              <input type="number" step="0.01" min={0} required value={form.precoAluguer} onChange={(e) => setForm({ ...form, precoAluguer: e.target.value })} style={{ width: '100%', padding: 10 }} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 15 }}>
            <label>Telefone *</label>
            <input type="text" maxLength={9} required value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value.replace(/\D/g, '') })} style={{ width: '100%', padding: 10 }} />
          </div>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label>Foto {editId ? '' : '*'}</label>
            <input type="file" accept="image/*" required={!editId} onChange={(e) => setForm({ ...form, imagemFile: e.target.files?.[0] || null })} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn-primary" style={{ width: '40%', background: 'white', color: '#64748b', border: '1px solid #cbd5e1' }} onClick={() => setItemModal(false)}>Cancelar</button>
            <button type="submit" className="btn-primary" style={{ width: '60%' }}>Guardar</button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(deleteId)} onClose={() => setDeleteId(null)} maxWidth={400}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 10 }}>🗑️</div>
          <h2 style={{ color: '#ef4444', marginTop: 0 }}>Apagar Peça?</h2>
          <p style={{ color: '#666', marginBottom: 25 }}>
            Tem a certeza de que deseja apagar esta peça? Esta ação não pode ser desfeita e deixará de
            aparecer no catálogo geral.
          </p>
          <div style={{ display: 'flex', gap: 15, justifyContent: 'center' }}>
            <button
              type="button"
              className="btn-primary"
              style={{ flex: 1, background: 'white', color: '#64748b', border: '1px solid #cbd5e1' }}
              onClick={() => setDeleteId(null)}
            >
              Cancelar
            </button>
            <button type="button" className="btn-primary" style={{ flex: 1, background: '#ef4444', border: 'none' }} onClick={handleDelete}>
              Sim, Apagar
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={Boolean(contactItem)} onClose={() => setContactItem(null)} maxWidth={400}>
        <ModalCloseButton onClose={() => setContactItem(null)} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>💬</div>
          <h2 style={{ marginTop: 0, color: '#10b981' }}>Contactar Vendedor</h2>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: 20 }}>
            Gostou do artigo <strong style={{ color: '#10b981' }}>{contactItem?.descricao}</strong>?
            Entre em contacto direto para combinar negocio.
          </p>
          <div
            style={{
              background: '#f8fafc',
              padding: 25,
              borderRadius: 12,
              marginBottom: 20,
              border: '1px solid #e2e8f0',
            }}
          >
            <p style={{ margin: '0 0 5px', fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>
              Telefone Direto
            </p>
            <h3 style={{ margin: 0, color: 'var(--secondary)', letterSpacing: 2, fontSize: '1.8rem' }}>
              {contactItem?.telefone && contactItem.telefone !== 'null' ? contactItem.telefone : '---'}
            </h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 20, lineHeight: 1.4 }}>
            A Ent&apos;Artes não intermedeia pagamentos nem se responsabiliza por transações entre
            particulares no marketplace.
          </p>
          {contactItem?.telefone && contactItem.telefone !== 'null' && (
            <a
              className="btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                background: '#25d366',
                border: 'none',
                textDecoration: 'none',
                padding: 12,
                marginBottom: 10,
              }}
              href={`https://wa.me/351${String(contactItem.telefone).replace(/\D/g, '')}?text=${encodeURIComponent(`Ola! Vi o anuncio "${contactItem.descricao}" na plataforma Ent'Artes.`)}`}
              target="_blank"
              rel="noreferrer"
            >
              Enviar WhatsApp
            </a>
          )}
          <button
            type="button"
            className="btn-primary"
            style={{ width: '100%', background: 'white', color: '#64748b', border: '1px solid #cbd5e1' }}
            onClick={() => setContactItem(null)}
          >
            Fechar
          </button>
        </div>
      </Modal>

      <Modal open={Boolean(rentItem)} onClose={() => setRentItem(null)} maxWidth={450}>
        <ModalCloseButton onClose={() => setRentItem(null)} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🏫</div>
          <h2 style={{ marginTop: 0, color: 'var(--secondary)' }}>Requisitar Peça</h2>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: 20 }}>
            Pedir aluguer da peça <strong style={{ color: 'var(--primary)' }}>{rentItem?.descricao}</strong>{' '}
            à escola. A direção irá analisar o pedido; o pagamento é feito presencialmente na secretaria.
            <br />
            <br />
            <strong>
              Preço referência:{' '}
              <span style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>
                {parseFloat(rentItem?.precoAluguer || 0).toFixed(2)}€
              </span>
            </strong>
          </p>
        </div>
        <form onSubmit={submitRentRequest}>
          <div style={{ display: 'flex', gap: 15, marginBottom: 15 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold', color: 'var(--secondary)', fontSize: '0.85rem' }}>
                Data de início *
              </label>
              <input
                type="date"
                required
                value={rentDates.inicio}
                onChange={(e) => {
                  const inicio = e.target.value;
                  let fim = rentDates.fim;
                  if (inicio) {
                    const max = new Date(inicio);
                    max.setFullYear(max.getFullYear() + 1);
                    const maxStr = max.toISOString().split('T')[0];
                    if (!fim || fim < inicio || fim > maxStr) fim = '';
                  }
                  setRentDates((d) => ({ ...d, inicio, fim }));
                }}
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold', color: 'var(--secondary)', fontSize: '0.85rem' }}>
                Data de fim *
              </label>
              <input
                type="date"
                required
                min={rentDates.inicio}
                max={rentMaxFim}
                value={rentDates.fim}
                onChange={(e) => setRentDates((d) => ({ ...d, fim: e.target.value }))}
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
              />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 25 }}>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold', color: 'var(--secondary)' }}>
              Observações (opcional)
            </label>
            <textarea
              rows={3}
              placeholder="Alguma nota adicional?"
              value={rentDates.observacoes}
              onChange={(e) => setRentDates((d) => ({ ...d, observacoes: e.target.value }))}
              style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ccc', resize: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="btn-primary"
              style={{ flex: 1, background: 'white', color: '#64748b', border: '1px solid #cbd5e1' }}
              onClick={() => setRentItem(null)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary" style={{ flex: 2, padding: 12 }}>
              Enviar pedido
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={successModal} onClose={() => setSuccessModal(false)} maxWidth={400}>
        <div style={{ textAlign: 'center', padding: 10 }}>
          <div
            style={{
              width: 80,
              height: 80,
              background: '#dcfce7',
              color: '#22c55e',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '2.5rem',
            }}
          >
            ✓
          </div>
          <h2 style={{ color: '#1e293b', marginBottom: 10 }}>Pedido enviado!</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 30 }}>
            O pedido de aluguer foi enviado à direção para aprovação.
            <br />
            Consulte o separador <strong>Alugados</strong> para acompanhar o estado. O pagamento é feito na
            secretaria após aprovação.
          </p>
          <button
            type="button"
            className="btn-primary"
            style={{ width: '100%', padding: 12, background: '#10b981', border: 'none' }}
            onClick={() => setSuccessModal(false)}
          >
            Entendido
          </button>
        </div>
      </Modal>

      <Modal open={professorBlock} onClose={() => setProfessorBlock(false)} maxWidth={400}>
        <div style={{ textAlign: 'center', padding: 10 }}>
          <div
            style={{
              width: 80,
              height: 80,
              background: '#fee2e2',
              color: '#ef4444',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '2.5rem',
            }}
          >
            ⚠️
          </div>
          <h2 style={{ color: '#1e293b', marginBottom: 10 }}>Ação Não Permitida</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 30 }}>
            Neste momento, as requisições de peças da escola têm de ser feitas exclusivamente por um{' '}
            <strong>encarregado de educação</strong>.
            <br />
            <br />A sua conta de docente não tem permissão para realizar este aluguer.
          </p>
          <button
            type="button"
            className="btn-primary"
            style={{ width: '100%', padding: 12, background: '#ef4444', border: 'none', fontWeight: 'bold' }}
            onClick={() => setProfessorBlock(false)}
          >
            Entendido
          </button>
        </div>
      </Modal>
    </section>
  );
}
