import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserId } from '../../api/auth';
import { USER_TYPES } from '../../api/config';
import { updateUserProfile } from '../../api/profile';
import { useGuardianProfile } from '../../hooks/useGuardianProfile';
import { useTeacherProfile } from '../../hooks/useTeacherProfile';
import Modal, { ModalCloseButton } from '../ui/Modal';
import { useNotification } from '../../context/NotificationContext';

const inputStyle = { width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', fontFamily: 'inherit' };
const labelStyle = { display: 'block', marginBottom: 5, fontWeight: 'bold', color: 'var(--secondary)' };

const BILLING_ROWS = [
  { data: '10 Abril 2026', desc: 'Mensalidade Abril', valor: '55.00€' },
  { data: '15 Março 2026', desc: 'Coaching Solo (60m)', valor: '36.00€' },
  { data: '10 Março 2026', desc: 'Mensalidade Março', valor: '55.00€' },
];

const TEACHER_BILLING_EXTRA = { horas: '42.5h', ganhos: '0.00' };

export default function DashboardProfileModals({ userType, displayName, openModal, onCloseModal }) {
  const { user } = useAuth();
  const { notify } = useNotification();
  const userId = getUserId(user);
  const isTeacher = userType === USER_TYPES.TEACHER;
  const { profile: guardianProfile } = useGuardianProfile();
  const { profile: teacherProfile } = useTeacherProfile();

  const [form, setForm] = useState({ nome: '', telemovel: '', nif: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [language, setLanguage] = useState('pt');

  useEffect(() => {
    if (openModal !== 'profile') return;
    const p = isTeacher ? teacherProfile : guardianProfile;
    setForm({
      nome: p.nome || displayName,
      telemovel: p.telefone || '',
      nif: p.nif || '',
      email: p.email || user?.email || '',
    });
  }, [openModal, isTeacher, teacherProfile, guardianProfile, displayName, user?.email]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    try {
      await updateUserProfile(userId, {
        nome: form.nome,
        telemovel: form.telemovel,
        nif: form.nif,
        email: form.email,
      });
      await notify({
        title: 'Sucesso',
        message: 'Perfil atualizado com sucesso!',
        variant: 'success',
      });
      onCloseModal();
      window.location.reload();
    } catch {
      await notify({
        title: 'Erro',
        message: 'Ocorreu um erro ao atualizar o perfil.',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=00bcd4&color=fff&bold=true`;

  return (
    <>
      <Modal open={openModal === 'profile'} onClose={onCloseModal} maxWidth={500}>
        <ModalCloseButton onClose={onCloseModal} />
        <h2 style={{ marginTop: 0, color: 'var(--secondary)' }}>
          {isTeacher ? 'O Meu Perfil Profissional' : 'O Meu Perfil'}
        </h2>
        {!isTeacher && (
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: 20 }}>
            Atualize os seus dados pessoais e de contacto.
          </p>
        )}
        <form onSubmit={handleSaveProfile}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 20 }}>
            <img src={avatarUrl} alt="" style={{ width: 70, height: 70, borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <label style={{ ...labelStyle, fontSize: '0.8rem' }}>Fotografia de Perfil</label>
              <input type="file" accept="image/*" style={{ fontSize: '0.8rem' }} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 15 }}>
            <label style={labelStyle}>Nome Completo *</label>
            <input type="text" required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} style={inputStyle} />
          </div>
          <div style={{ display: 'flex', gap: 15, marginBottom: 15 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={labelStyle}>Telemóvel *</label>
              <input type="tel" required value={form.telemovel} onChange={(e) => setForm({ ...form, telemovel: e.target.value })} style={inputStyle} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={labelStyle}>NIF Fiscal *</label>
              <input type="text" required value={form.nif} onChange={(e) => setForm({ ...form, nif: e.target.value })} style={inputStyle} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 25 }}>
            <label style={labelStyle}>Email *</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn-primary" style={{ width: '40%', background: 'white', color: '#64748b', border: '1px solid #cbd5e1' }} onClick={onCloseModal}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" style={{ width: '60%', padding: 12 }} disabled={saving}>
              {saving ? 'A guardar...' : 'Guardar Alterações'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={openModal === 'students'} onClose={onCloseModal} maxWidth={500}>
        <ModalCloseButton onClose={onCloseModal} />
        <h2 style={{ marginTop: 0, color: 'var(--secondary)' }}>Os Meus Educandos</h2>
        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: 20 }}>Gira os educandos associados à sua conta.</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 15, border: '1px solid #e2e8f0', borderRadius: 12, marginBottom: 15, background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
            <div style={{ background: 'var(--primary)', color: 'white', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>LS</div>
            <div>
              <h4 style={{ margin: 0, color: '#1e293b', fontSize: '1rem' }}>Leonor Santos</h4>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>Idade: 12 anos | Nº Aluno: 4021</p>
            </div>
          </div>
          <button type="button" className="btn-primary" style={{ background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '5px 10px', fontSize: '0.8rem' }} onClick={() => notify({ title: 'Em breve', message: 'Editar aluno em breve', variant: 'info' })}>
            Editar
          </button>
        </div>
        <button type="button" className="btn-primary" style={{ width: '100%', background: 'white', color: 'var(--primary)', border: '2px dashed var(--primary)' }} onClick={() => notify({ title: 'Em breve', message: 'Formulário de inscrição em breve', variant: 'info' })}>
          + Adicionar Novo Educando
        </button>
      </Modal>

      <Modal open={openModal === 'billing'} onClose={onCloseModal} maxWidth={600}>
        <ModalCloseButton onClose={onCloseModal} />
        <h2 style={{ marginTop: 0, color: 'var(--secondary)' }}>
          {isTeacher ? 'Meus Recibos e Horas' : 'Faturação e Recibos'}
        </h2>
        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: 20 }}>
          {isTeacher
            ? 'Consulte o resumo de horas e recibos de coaching.'
            : 'Consulte as suas mensalidades, pagamentos de coachings e descarregue faturas.'}
        </p>
        {isTeacher && (
          <p style={{ marginBottom: 16, color: '#64748b', fontSize: '0.9rem' }}>
            Horas este mês: <strong>{TEACHER_BILLING_EXTRA.horas}</strong> · Ganhos coaching:{' '}
            <strong>{TEACHER_BILLING_EXTRA.ganhos}€</strong>
          </p>
        )}
        <div className="custom-table-wrapper" style={{ maxHeight: 300, overflowY: 'auto' }}>
          <table className="clean-table" style={{ width: '100%', fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Valor</th>
                <th>Estado</th>
                <th>Fatura</th>
              </tr>
            </thead>
            <tbody>
              {BILLING_ROWS.map((row) => (
                <tr key={row.data + row.desc}>
                  <td>{row.data}</td>
                  <td>{row.desc}</td>
                  <td>{row.valor}</td>
                  <td>
                    <span className="badge-green" style={{ background: '#dcfce7', color: '#059669', padding: '3px 8px', borderRadius: 12 }}>
                      Pago
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <a href="#" onClick={(e) => e.preventDefault()} style={{ color: '#64748b', textDecoration: 'none' }} title="Descarregar PDF">
                      ⬇️ PDF
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      <Modal open={openModal === 'classes'} onClose={onCloseModal} maxWidth={550}>
        <ModalCloseButton onClose={onCloseModal} />
        <h2 style={{ marginTop: 0, color: 'var(--secondary)' }}>As Minhas Turmas</h2>
        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: 20 }}>Turmas atribuídas neste ano letivo.</p>
        <div style={{ padding: 15, border: '1px solid #e2e8f0', borderRadius: 12, marginBottom: 12, background: '#f8fafc' }}>
          <h4 style={{ margin: '0 0 8px', color: '#1e293b' }}>Ballet Iniciados A</h4>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Segunda 17:00 · Estúdio 1 · 12 alunos</p>
        </div>
        <button type="button" className="btn-primary" style={{ width: '100%' }} onClick={() => notify({ title: 'Em desenvolvimento', message: 'Funcionalidade em desenvolvimento', variant: 'info' })}>
          Ver Pauta Completa
        </button>
      </Modal>

      <Modal open={openModal === 'settings'} onClose={onCloseModal} maxWidth={450}>
        <ModalCloseButton onClose={onCloseModal} />
        <h2 style={{ marginTop: 0, color: 'var(--secondary)' }}>Configurações</h2>
        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: 25 }}>Personalize a sua experiência no portal Ent&apos;Artes.</p>
        <h4 style={{ color: '#1e293b', marginBottom: 15, borderBottom: '1px solid #f1f5f9', paddingBottom: 5 }}>Notificações</h4>
        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
          <span style={{ fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Alertas por Email</span>
          <input type="checkbox" checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} />
        </label>
        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
          <span style={{ fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Alertas por SMS (Telemóvel)</span>
          <input type="checkbox" checked={smsAlerts} onChange={(e) => setSmsAlerts(e.target.checked)} />
        </label>
        <h4 style={{ color: '#1e293b', marginBottom: 15, borderBottom: '1px solid #f1f5f9', paddingBottom: 5 }}>Idioma</h4>
        <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ ...inputStyle, marginBottom: 25 }}>
          <option value="pt">Português</option>
          <option value="en">English</option>
        </select>
        <button type="button" className="btn-primary" style={{ width: '100%', padding: 12 }} onClick={async () => { await notify({ title: 'Sucesso', message: 'Configurações guardadas!', variant: 'success' }); onCloseModal(); }}>
          Guardar Configurações
        </button>
      </Modal>
    </>
  );
}
