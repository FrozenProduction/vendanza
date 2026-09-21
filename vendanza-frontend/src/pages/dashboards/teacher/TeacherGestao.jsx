import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getUserId } from '../../../api/auth';
import {
  fetchTeacherPrivateLessons,
  updatePrivateLessonState,
  verifyPastLessons,
} from '../../../api/teacher';
import LoadingOverlay from '../../../components/ui/LoadingOverlay';
import { useNotification } from '../../../context/NotificationContext';

function studentName(aula) {
  if (!aula.encEducacao) return 'A definir';
  const enc = aula.encEducacao;
  return `${enc.nomeAluno || enc.nomeEncEducacao || ''} ${enc.apelidoAluno || enc.apelidoEncEducacao || ''}`.trim() || 'A definir';
}

export default function TeacherGestao() {
  const { user } = useAuth();
  const teacherId = getUserId(user);
  const { notify, confirm, prompt } = useNotification();

  const [privadas, setPrivadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const load = useCallback(async () => {
    if (!teacherId) return;
    setLoading(true);
    try {
      const aulasPriv = await fetchTeacherPrivateLessons(teacherId);
      setPrivadas(aulasPriv);
    } catch (e) {
      console.error('Erro gestão professor:', e);
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    verifyPastLessons();
    load();
  }, [load]);

  const pedidos = privadas.filter((a) =>
    ['Pedido', 'A Aguardar', 'Pendente'].includes(a.estado),
  );

  const handleUpdate = async (id, novoEstado) => {
    const ok = await confirm({
      title: 'Confirmar alteração',
      message: `Tem a certeza que deseja marcar esta aula como "${novoEstado}"?`,
    });
    if (!ok) return;

    setProcessing(true);
    try {
      await updatePrivateLessonState(id, novoEstado);
      await notify({
        title: 'Sucesso',
        message: `Aula atualizada para ${novoEstado}!`,
        variant: 'success',
      });
      await load();
    } catch {
      await notify({
        title: 'Erro',
        message: 'Erro ao atualizar o estado da aula.',
        variant: 'error',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (id) => {
    const justificacao = await prompt({
      title: 'Rejeitar pedido',
      message: 'Indique o motivo para não aceitar este pedido:',
      placeholder: 'Motivo da rejeição...',
    });
    if (justificacao === null) return;

    await notify({
      title: 'Rejeição registada',
      message: `A Direção será notificada com o motivo: "${justificacao}" para gerir o cancelamento.`,
      variant: 'info',
    });
    await handleUpdate(id, 'Rejeitada');
  };

  return (
    <section className="section-view active">
      <LoadingOverlay visible={loading || processing} />
      <div className="card">
        <h2 style={{ color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: 15 }}>
          Gestão de Pedidos
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 20 }}>
          Analise e responda aos novos pedidos de aulas privadas.
        </p>

        <div className="custom-table-wrapper">
          <table className="clean-table">
            <thead>
              <tr>
                <th>Data / Hora</th>
                <th>Detalhes</th>
                <th>Estado</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center' }}>
                    Sem novos pedidos de momento.
                  </td>
                </tr>
              )}
              {pedidos.map((aula) => (
                <tr key={aula.idAulaPrivada}>
                  <td>
                    {aula.dia || 'A definir'}
                    <br />
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {aula.horaInicio || '--:--'}
                    </span>
                  </td>
                  <td>
                    Privada (Tipo: {aula.cod_tipoaula}) <br />
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Aluno: {studentName(aula)}
                    </span>
                  </td>
                  <td>
                    <span className="badge-orange">Por Analisar</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button
                        type="button"
                        className="btn-green"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        onClick={() => handleUpdate(aula.idAulaPrivada, 'Aguardar Direcao')}
                      >
                        ✓ Aceitar
                      </button>
                      <button
                        type="button"
                        className="btn-outline"
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.8rem',
                          color: '#ef4444',
                          borderColor: '#ef4444',
                        }}
                        onClick={() => handleReject(aula.idAulaPrivada)}
                      >
                        ❌ Rejeitar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
