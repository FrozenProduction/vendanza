import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getUserId } from '../../../api/auth';
import { fetchSchedules } from '../../../api/schedule';
import { fetchTeacherPrivateLessons, verifyPastLessons } from '../../../api/teacher';
import LoadingOverlay from '../../../components/ui/LoadingOverlay';

function privateStatusBadge(aula) {
  const { estado } = aula;
  if (['Realizada', 'Concluída', 'Concluida'].includes(estado)) {
    return <span className="status-badge status-completed">{estado}</span>;
  }
  if (['Rejeitada', 'Cancelada'].includes(estado)) {
    return <span className="status-badge status-cancelled">{estado}</span>;
  }
  if (estado === 'Aguardar Direcao') {
    return (
      <span className="status-badge status-pending" style={{ background: '#e0f2fe', color: '#0369a1' }}>
        Aceite pelo Prof.
      </span>
    );
  }
  if (estado === 'Falta') {
    return <span className="status-badge status-absent">Falta</span>;
  }
  if (estado === 'Agendada') {
    return <span className="status-badge status-scheduled">Agendada</span>;
  }
  return <span className="status-badge status-pending">Pendente</span>;
}

function privateActionLabel(aula) {
  const { estado, dia, horaInicio } = aula;
  if (['Realizada', 'Concluída', 'Concluida'].includes(estado)) {
    return <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 'bold' }}>Validar pela Direção</span>;
  }
  if (['Rejeitada', 'Cancelada'].includes(estado)) {
    return <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 'bold' }}>Devolvido à Direção</span>;
  }
  if (estado === 'Aguardar Direcao') {
    return <span style={{ color: '#0369a1', fontSize: '0.85rem', fontWeight: 'bold' }}>Aguardar Estúdio (Direção)</span>;
  }
  if (estado === 'Falta') {
    return <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 'bold' }}>Fechado</span>;
  }
  if (estado === 'Agendada') {
    const dataAula = new Date(`${dia}T${horaInicio}`);
    if (dataAula > new Date()) {
      return <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 'bold' }}>Aguardar realização</span>;
    }
    return (
      <span style={{ color: '#f59e0b', fontSize: '0.85rem', fontWeight: 'bold' }}>
        Aguardar registo de presença
      </span>
    );
  }
  return <span style={{ color: '#f59e0b', fontSize: '0.85rem', fontWeight: 'bold' }}>Aguardar Admin (Estúdio)</span>;
}

export default function TeacherHistory() {
  const { user } = useAuth();
  const teacherId = getUserId(user);

  const [histTab, setHistTab] = useState('privadas');
  const [privadas, setPrivadas] = useState([]);
  const [regulares, setRegulares] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!teacherId) return;
    setLoading(true);
    try {
      const [aulasPriv, horarios] = await Promise.all([
        fetchTeacherPrivateLessons(teacherId),
        fetchSchedules(),
      ]);
      setPrivadas(aulasPriv);
      setRegulares(horarios.filter((h) => h.idDocente === teacherId));
    } catch (e) {
      console.error('Erro histórico professor:', e);
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    verifyPastLessons();
    load();
  }, [load]);

  const historicoPrivadas = privadas.filter(
    (a) => !['Pedido', 'A Aguardar', 'Pendente'].includes(a.estado),
  );

  return (
    <section className="section-view active">
      <LoadingOverlay visible={loading} />
      <div className="card">
        <h2 style={{ color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: 15 }}>
          Histórico de Aulas
        </h2>

        <div
          style={{
            display: 'flex',
            gap: 15,
            marginBottom: 25,
            borderBottom: '2px solid #f1f5f9',
            paddingBottom: 20,
          }}
        >
          <button
            type="button"
            className={`inv-tab-btn${histTab === 'privadas' ? ' active' : ''}`}
            onClick={() => setHistTab('privadas')}
          >
            Aulas Privadas
          </button>
          <button
            type="button"
            className={`inv-tab-btn${histTab === 'regulares' ? ' active' : ''}`}
            onClick={() => setHistTab('regulares')}
          >
            Aulas Regulares
          </button>
        </div>

        {histTab === 'privadas' && (
          <div className="custom-table-wrapper">
            <table className="clean-table">
              <thead>
                <tr>
                  <th>Data / Hora</th>
                  <th>Tipo</th>
                  <th>Preço</th>
                  <th>Estado</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {historicoPrivadas.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center' }}>
                      Ainda não tem histórico de aulas privadas em andamento.
                    </td>
                  </tr>
                )}
                {historicoPrivadas.map((aula) => (
                  <tr key={aula.idAulaPrivada}>
                    <td>
                      {aula.dia}{' '}
                      <br />
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {aula.horaInicio} - {aula.horaFim}
                      </span>
                    </td>
                    <td>Privada (Tipo: {aula.cod_tipoaula})</td>
                    <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                      {aula.preco ? `${aula.preco}€` : 'N/A'}
                    </td>
                    <td>{privateStatusBadge(aula)}</td>
                    <td>{privateActionLabel(aula)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {histTab === 'regulares' && (
          <div className="custom-table-wrapper">
            <table className="clean-table">
              <thead>
                <tr>
                  <th>Dia</th>
                  <th>Horário</th>
                  <th>Modalidade</th>
                  <th>Estúdio</th>
                </tr>
              </thead>
              <tbody>
                {regulares.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center' }}>
                      Sem turmas regulares atribuídas.
                    </td>
                  </tr>
                )}
                {regulares.map((h) => (
                  <tr key={h.idHorario}>
                    <td style={{ fontWeight: 'bold', color: 'var(--secondary)' }}>{h.diaSemana}</td>
                    <td style={{ color: '#64748b' }}>
                      {h.horaInicio.substring(0, 5)} - {h.horaFim.substring(0, 5)}
                    </td>
                    <td>{h.modalidade ? h.modalidade.descricao : `Turma ID ${h.idModalidade}`}</td>
                    <td>Estúdio {h.idEstudio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
