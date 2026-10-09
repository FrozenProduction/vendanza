import { Link } from 'react-router-dom';
import MiniCalendar from '../../../components/dashboard/MiniCalendar';
import { useGuardianProfile } from '../../../hooks/useGuardianProfile';
import { useGuardianHomeData } from '../../../hooks/useGuardianHomeData';

function statusClass(estado) {
  if (['Concluída', 'Concluida', 'Realizada', 'Paga'].includes(estado)) return 'status-sucesso';
  if (['Falta', 'Cancelada', 'Rejeitada'].includes(estado)) return 'status-erro';
  if (estado === 'Agendada') return 'status-info';
  if (['Pendente', 'Pedido'].includes(estado)) return 'status-aviso';
  return 'status-padrao';
}

export default function GuardianHome() {
  const { profile } = useGuardianProfile();
  const { mensalidade, turmas, aulasHoje, pendentes, historico, eventos, eventDays, loading } =
    useGuardianHomeData();

  return (
    <section className="section-view active">
      <div className="guardian-dash-grid">
        <div className="left-col">
          <div className="guardian-card welcome-banner">
            <div className="welcome-banner-content">
              <p
                style={{
                  marginBottom: 5,
                  fontWeight: 700,
                  color: '#64748b',
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                }}
              >
                Bem-vindo(a) de volta
              </p>
              <h1 className="user-name">{profile.nome}</h1>
              <p>
                Acompanhe o percurso da sua educanda. Aceda rapidamente aos horários, pagamentos e
                estado das suas requisições.
              </p>
              <Link
                to="/portal/horario"
                className="inv-tab-btn active"
                style={{ padding: '8px 20px', marginTop: 10, display: 'inline-block' }}
              >
                Ver Mapa de Aulas Completo
              </Link>
            </div>
            <div className="welcome-illustration">📅</div>
          </div>

          <div className="stats-2x2">
            <div className="stat-box">
              <h4>Aulas Hoje</h4>
              <div className="val val-cyan">
                {loading ? '0' : aulasHoje.split(' / ')[0]}
                <span>
                  {' '}
                  / {loading ? '0h' : `${aulasHoje.split(' / ')[1] || '0h'}`}
                </span>
              </div>
            </div>
            <div className="stat-box">
              <h4>Pendentes</h4>
              <div className="val val-orange">
                {loading ? '00' : pendentes} <span>Coachings</span>
              </div>
            </div>
            <div className="stat-box">
              <h4>Mensalidade</h4>
              <div className="val val-green">{mensalidade}</div>
            </div>
            <div className="stat-box">
              <h4>Modalidades Inscritas</h4>
              <div className="val val-dark">
                {turmas} <span>Ativas</span>
              </div>
            </div>
          </div>

          <div className="guardian-card">
            <h3 style={{ margin: '0 0 1.5rem', color: '#1e293b', fontSize: '1.1rem' }}>
              Histórico de Aulas
            </h3>
            <div className="custom-table-wrapper">
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>Estado</th>
                    <th>Turma / Modalidade</th>
                    <th>Professor</th>
                    <th>Horário</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', color: '#64748b' }}>
                        A carregar histórico...
                      </td>
                    </tr>
                  )}
                  {!loading && historico.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: 20, color: '#64748b' }}>
                        Sem histórico recente.
                      </td>
                    </tr>
                  )}
                  {historico.map((aula) => {
                    const modName = aula.modalidade?.descricao || 'Coaching';
                    const profName = aula.docente
                      ? `${aula.docente.nome} ${aula.docente.apelido}`
                      : 'A definir';
                    return (
                      <tr key={aula.idAulaPrivada}>
                        <td>
                          <span className={statusClass(aula.estado)}>{aula.estado}</span>
                        </td>
                        <td>
                          <div className="user-info">
                            <div className="user-avatar" style={{ background: '#e8faff', color: '#00bcd4' }}>
                              {modName.substring(0, 2).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 600, color: '#1e293b' }}>{modName}</span>
                          </div>
                        </td>
                        <td style={{ color: '#64748b', fontSize: '0.9rem' }}>{profName}</td>
                        <td style={{ color: '#64748b', fontSize: '0.9rem' }}>
                          {aula.horaInicio?.substring(0, 5)} - {aula.horaFim?.substring(0, 5)}
                          <br />
                          <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                            Estúdio {aula.estudio?.idEstudio ?? 'N/A'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="right-col">
          <div className="guardian-card">
            <MiniCalendar eventDays={eventDays} />
          </div>

          <div className="guardian-card">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.1rem', fontWeight: 700 }}>
                Próximos Eventos
              </h3>
              <Link
                to="/portal/horario"
                style={{ color: 'var(--primary)', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 700 }}
              >
                Ver Todos
              </Link>
            </div>
            {loading && <p style={{ color: '#64748b', fontSize: '0.85rem' }}>A carregar eventos...</p>}
            {!loading && eventos.length === 0 && (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
                  Sem eventos futuros marcados.
                </p>
                <Link
                  to="/portal/horario"
                  style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 'bold' }}
                >
                  Agendar no Mapa de Aulas
                </Link>
              </div>
            )}
            {eventos.map((f) => {
              const modName = f.modalidade?.descricao || 'Coaching Particular';
              const dataLabel = f.dia === new Date().toISOString().split('T')[0] ? 'Hoje' : f.dia;
              const cores = ['#10b981', '#f59e0b', '#00bcd4', '#8b5cf6'];
              const dotColor = cores[f.idAulaPrivada % cores.length];
              return (
                <div
                  key={f.idAulaPrivada}
                  className="task-item"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 15,
                    marginBottom: 15,
                    paddingBottom: 15,
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <div
                    style={{ width: 10, height: 10, borderRadius: '50%', background: dotColor, marginTop: 5 }}
                  />
                  <div className="task-details">
                    <h4 style={{ margin: '0 0 5px', color: '#1e293b', fontSize: '0.95rem' }}>{modName}</h4>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
                      Estúdio {f.estudio?.idEstudio ?? 'A definir'} ({dataLabel} às{' '}
                      {f.horaInicio?.substring(0, 5)})
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
