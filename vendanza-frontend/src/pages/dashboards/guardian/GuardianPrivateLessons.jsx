import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getUserId } from '../../../api/auth';
import { fetchPrivateLessons, updatePrivateLessonState } from '../../../api/schedule';
import LoadingOverlay from '../../../components/ui/LoadingOverlay';
import { useNotification } from '../../../context/NotificationContext';

const FORMAT_NAMES = { 1: 'Particular', 2: 'Dueto', 3: 'Trio', 4: 'Ensemble' };

function statusClass(estado) {
  if (estado === 'Concluida' || estado === 'Concluída' || estado === 'Realizada') return 'status-realized';
  if (estado === 'Agendada') return 'status-scheduled';
  if (estado === 'Aguardar Direcao') return 'status-pending';
  if (estado === 'Pendente' || estado === 'Pedido') return 'status-pending';
  if (estado === 'Falta') return 'status-absent';
  if (estado === 'Cancelada' || estado === 'Rejeitada') return 'status-cancelled';
  return 'status-pending';
}

function ActionCell({ aula, onUpdate, onReportAbsence }) {
  const { estado, idAulaPrivada, dia, horaInicio } = aula;

  if (estado === 'Pendente') {
    return (
      <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 'bold' }}>
        Aguardar confirmação da aula
      </span>
    );
  }
  if (estado === 'Aguardar Direcao') {
    return (
      <span style={{ color: '#0369a1', fontSize: '0.85rem', fontWeight: 'bold' }}>
        Prof. Aceitou (Aguardar Estúdio)
      </span>
    );
  }
  if (estado === 'Agendada') {
    return <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 'bold' }}>Aula marcada</span>;
  }
  if (estado === 'Realizada') {
    const dataAula = new Date(`${dia}T${horaInicio}`);
    const diffHoras = (Date.now() - dataAula.getTime()) / (1000 * 60 * 60);
    if (diffHoras <= 48) {
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <button
            type="button"
            className="btn-outline"
            style={{ padding: '4px 8px', fontSize: '0.75rem', borderColor: '#2c8927', color: '#2c8927' }}
            onClick={() => onUpdate(idAulaPrivada, 'Concluida')}
          >
            ✓ Confirmar Presença
          </button>
          <button
            type="button"
            className="btn-outline"
            style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#ef4444', borderColor: '#ef4444' }}
            onClick={() => onReportAbsence(idAulaPrivada)}
          >
            ❌ Reportar Falta
          </button>
        </div>
      );
    }
    return (
      <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 'bold' }}>
        Prazo de verificação expirado
      </span>
    );
  }
  if (estado === 'Concluida' || estado === 'Concluída') {
    return <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 'bold' }}>Concluída</span>;
  }
  if (estado === 'Falta') {
    return <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 'bold' }}>Falta registada</span>;
  }
  if (estado === 'Rejeitada' || estado === 'Cancelada') {
    return <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 'bold' }}>Cancelada</span>;
  }
  return <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 'bold' }}>Aguardar professor</span>;
}

export default function GuardianPrivateLessons() {
  const { user } = useAuth();
  const userId = getUserId(user);
  const { notify, confirm } = useNotification();
  const [aulas, setAulas] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await fetchPrivateLessons(userId);
      setAulas(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpdate = async (id, estado) => {
    const ok = await confirm({
      title: 'Confirmar',
      message: `Confirma que a aula foi ${estado}? (Esta ação envia o registo para faturação)`,
    });
    if (!ok) return;

    try {
      await updatePrivateLessonState(id, estado);
      await notify({
        title: 'Sucesso',
        message: 'Presença registada com sucesso!',
        variant: 'success',
      });
      load();
    } catch {
      await notify({
        title: 'Erro',
        message: 'Erro ao atualizar o estado da aula.',
        variant: 'error',
      });
    }
  };

  const handleReportAbsence = async (id) => {
    const ok = await confirm({
      title: 'Reportar falta',
      message: 'Tem a certeza que deseja reportar a sua FALTA nesta aula?',
      danger: true,
      confirmLabel: 'Reportar Falta',
    });
    if (!ok) return;
    await handleUpdate(id, 'Falta');
  };

  return (
    <section className="section-view active">
      <LoadingOverlay visible={loading} />
      <div className="card">
        <h2>Histórico</h2>
        <div className="table-responsive">
          <table id="historyTable">
            <thead>
              <tr>
                <th>Data</th>
                <th>Horário</th>
                <th>Professor</th>
                <th>Formato</th>
                <th>Estúdio</th>
                <th>Estado</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {!loading && aulas.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center' }}>
                    Ainda não solicitou nenhuma aula privada.
                  </td>
                </tr>
              )}
              {aulas.map((aula) => {
                const teacherName = aula.docente
                  ? `${aula.docente.nome} ${aula.docente.apelido}`
                  : 'A definir';
                const studioId = aula.estudio?.idEstudio ?? aula.idEstudio ?? 'A definir';
                const studioName = studioId !== 'A definir' ? `Estúdio ${studioId}` : 'A definir';
                return (
                  <tr key={aula.idAulaPrivada}>
                    <td>{aula.dia}</td>
                    <td>
                      {aula.horaInicio?.substring(0, 5)} ({aula.duracao} min)
                    </td>
                    <td>{teacherName}</td>
                    <td>{FORMAT_NAMES[aula.cod_tipoaula] || 'Privada'}</td>
                    <td>{studioName}</td>
                    <td>
                      <span className={`status-badge ${statusClass(aula.estado)}`}>{aula.estado}</span>
                    </td>
                    <td>
                      <ActionCell
                        aula={aula}
                        onUpdate={handleUpdate}
                        onReportAbsence={handleReportAbsence}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
