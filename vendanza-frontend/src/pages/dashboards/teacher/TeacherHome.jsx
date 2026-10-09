import { Link } from 'react-router-dom';
import MiniCalendar from '../../../components/dashboard/MiniCalendar';
import { useTeacherProfile } from '../../../hooks/useTeacherProfile';
import { useTeacherSummary } from '../../../hooks/useTeacherSummary';

export default function TeacherHome() {
  const { profile } = useTeacherProfile();
  const {
    aulasHojeCount,
    aulasHojeHoras,
    pendentes,
    ganhosCoaching,
    turmas,
    proximasAulas,
    eventDays,
    loading,
  } = useTeacherSummary();

  return (
    <section className="section-view active">
      <div className="teacher-dash-grid">
        <div className="left-col">
          <div className="teacher-card welcome-banner">
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
                Vamos organizar o seu dia. Aceda rapidamente às suas tarefas, horários e validações
                pendentes.
              </p>
            </div>
            <div className="welcome-illustration">📅</div>
          </div>

          <div className="stats-2x2">
            <div className="stat-box">
              <h4>Aulas Hoje</h4>
              <div className="val val-cyan">
                <b style={{ fontWeight: 'inherit' }}>{loading ? '0' : aulasHojeCount}</b>
                <span>
                  {' '}
                  / <span>{loading ? '0' : aulasHojeHoras}</span>h
                </span>
              </div>
            </div>
            <div className="stat-box">
              <h4>Pendentes</h4>
              <div className="val val-orange">
                <b style={{ fontWeight: 'inherit' }}>{loading ? '0' : pendentes}</b>{' '}
                <span>Validações</span>
              </div>
            </div>
            <div className="stat-box">
              <h4>Ganhos Coaching</h4>
              <div className="val val-green">
                <b style={{ fontWeight: 'inherit' }}>{loading ? '0' : ganhosCoaching}</b>€{' '}
                <span>/ Mês</span>
              </div>
            </div>
            <div className="stat-box">
              <h4>Turmas Reg.</h4>
              <div className="val val-dark">
                <b style={{ fontWeight: 'inherit' }}>{loading ? '0' : turmas}</b> <span>Ativas</span>
              </div>
            </div>
          </div>
        </div>

        <div className="right-col">
          <div className="teacher-card">
            <MiniCalendar eventDays={eventDays} />
          </div>

          <div className="teacher-card">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.1rem', border: 'none', padding: 0 }}>
                Próximas Aulas
              </h3>
              <Link
                to="/professor/horario"
                style={{ color: '#00bcd4', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 700 }}
              >
                Ver Todas
              </Link>
            </div>

            {loading && (
              <p style={{ fontSize: '0.85rem', color: '#64748b', padding: 10 }}>A carregar agenda...</p>
            )}
            {!loading && proximasAulas.length === 0 && (
              <p style={{ fontSize: '0.85rem', color: '#64748b', padding: 10 }}>
                Sem aulas previstas para os próximos dias.
              </p>
            )}
            {proximasAulas.map((aula) => (
              <div key={`${aula.titulo}-${aula.ordem}`} className="task-item">
                <div className="task-details">
                  <h4>{aula.titulo}</h4>
                  <p>{aula.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
