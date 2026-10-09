import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getUserId } from '../../../api/auth';
import {
  fetchEnrollmentsForStudent,
  fetchModalities,
  fetchModalityTeachers,
  fetchStudios,
  submitCoachingRequest,
} from '../../../api/coaching';
import { calculateCoachingPrice, validateCoachingDateTime } from '../../../utils/coachingPrice';
import { useNotification } from '../../../context/NotificationContext';

const FORMAT_OPTIONS = [
  { value: 'solo', label: 'Particular' },
  { value: 'duet', label: 'Dueto' },
  { value: 'trio', label: 'Trio' },
  { value: 'ensemble', label: 'Ensemble' },
];

const DURATION_OPTIONS = [
  { value: '30', label: '30 Minutos' },
  { value: '60', label: '60 Minutos' },
  { value: '90', label: '90 Minutos' },
  { value: '120', label: '120 Minutos' },
];

export default function GuardianCoaching() {
  const { user } = useAuth();
  const userId = getUserId(user);
  const { notify } = useNotification();

  const [modalities, setModalities] = useState([]);
  const [studios, setStudios] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [modalityId, setModalityId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [studioId, setStudioId] = useState('');
  const [format, setFormat] = useState('solo');
  const [duration, setDuration] = useState('30');

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const pricing = useMemo(() => calculateCoachingPrice(format, duration), [format, duration]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    (async () => {
      try {
        const [allMods, inscricoes, allStudios] = await Promise.all([
          fetchModalities(),
          fetchEnrollmentsForStudent(userId),
          fetchStudios(),
        ]);
        if (cancelled) return;
        const idsInscritos = inscricoes.map((i) => i.modalidade.idModalidade);
        setModalities(
          allMods
            .filter((m) => idsInscritos.includes(m.idModalidade))
            .sort((a, b) => a.descricao.localeCompare(b.descricao)),
        );
        setStudios(allStudios);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const loadTeachers = useCallback(async (modId) => {
    if (!modId) {
      setTeachers([]);
      return;
    }
    try {
      const atribuicoes = await fetchModalityTeachers();
      const list = [];
      const seen = new Set();
      atribuicoes.forEach((atr) => {
        if (atr.modalidade && String(atr.modalidade.idModalidade) === String(modId) && atr.docente) {
          const key = atr.docente.idDocente;
          if (!seen.has(key)) {
            seen.add(key);
            list.push({ id: atr.docente.idDocente, name: `${atr.docente.nome} ${atr.docente.apelido}` });
          }
        }
      });
      setTeachers(list.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (e) {
      console.error(e);
      setTeachers([]);
    }
  }, []);

  useEffect(() => {
    setTeacherId('');
    loadTeachers(modalityId);
  }, [modalityId, loadTeachers]);

  const showWarning = (message) =>
    notify({ title: 'Aviso', message, variant: 'warning' });

  const handleDateChange = (value) => {
    if (value && new Date(value).getDay() === 0) {
      showWarning('Não são permitidas marcações aos Domingos.');
      setDate('');
      return;
    }
    if (value && startTime) {
      const validation = validateCoachingDateTime(value, startTime, duration);
      if (!validation.valid) {
        showWarning(validation.message);
        return;
      }
    }
    setDate(value);
  };

  const handleStartTimeChange = (value) => {
    if (date && value) {
      const validation = validateCoachingDateTime(date, value, duration);
      if (!validation.valid) {
        showWarning(validation.message);
        return;
      }
    }
    setStartTime(value);
  };

  const handleDurationChange = (value) => {
    if (date && startTime) {
      const validation = validateCoachingDateTime(date, startTime, value);
      if (!validation.valid) {
        showWarning(validation.message);
        return;
      }
    }
    setDuration(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!modalityId || !teacherId || !date || !startTime || !studioId) {
      await showWarning('Preencha todos os campos obrigatórios.');
      return;
    }
    const validation = validateCoachingDateTime(date, startTime, duration);
    if (!validation.valid) {
      await showWarning(validation.message);
      return;
    }
    if (!userId) {
      await notify({ title: 'Erro', message: 'Utilizador não autenticado.', variant: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      await submitCoachingRequest({
        idModalidade: parseInt(modalityId, 10),
        idDocente: parseInt(teacherId, 10),
        format,
        idEncEducacao: userId,
        idEstudio: parseInt(studioId, 10),
        dia: date,
        horaInicio: startTime,
        duration: parseInt(duration, 10),
        preco: pricing.total,
      });
      await notify({
        title: 'Pedido enviado',
        message: 'Pedido enviado com sucesso! Aguarde a validação da direção (máx. 48 h).',
        variant: 'success',
      });
      setModalityId('');
      setTeacherId('');
      setDate('');
      setStartTime('');
      setStudioId('');
      setFormat('solo');
      setDuration('30');
    } catch (err) {
      await notify({
        title: 'Erro',
        message: `Erro ao enviar pedido: ${err.message}`,
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="section-view active">
        <p style={{ color: '#64748b', padding: 24 }}>A carregar formulário…</p>
      </section>
    );
  }

  return (
    <section className="section-view active">
      <div className="card">
        <h2>Requisitar Aula Privada (Coaching)</h2>
        <form onSubmit={handleSubmit}>
          <div className="coaching-layout">
            <div className="coaching-form-side">
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="form-group">
                  <label>Modalidade</label>
                  <select value={modalityId} onChange={(e) => setModalityId(e.target.value)} required>
                    <option value="">Selecione a Modalidade...</option>
                    {modalities.map((m) => (
                      <option key={m.idModalidade} value={m.idModalidade}>
                        {m.descricao}
                      </option>
                    ))}
                  </select>
                </div>
                {modalityId && (
                  <div className="form-group">
                    <label>Professor</label>
                    <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} required>
                      <option value="">Selecione o Professor...</option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="form-group">
                  <label>Dia</label>
                  <input type="date" className="form-control" min={today} value={date} onChange={(e) => handleDateChange(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Hora de Início</label>
                  <input
                    type="time"
                    className="form-control"
                    value={startTime}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Estúdio</label>
                  <select value={studioId} onChange={(e) => setStudioId(e.target.value)} required>
                    <option value="">Selecione o estúdio…</option>
                    {studios.map((s) => (
                      <option key={s.idEstudio} value={s.idEstudio}>
                        {s.nomeEstudio || `Estúdio ${s.idEstudio}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Formato</label>
                  <select value={format} onChange={(e) => setFormat(e.target.value)}>
                    {FORMAT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Duração</label>
                  <select value={duration} onChange={(e) => handleDurationChange(e.target.value)}>
                    {DURATION_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="info-box" style={{ marginTop: '1rem', borderLeftColor: 'var(--accent)' }}>
                <small style={{ display: 'block', color: '#64748b' }}>
                  A reserva será confirmada após validação do estúdio e do professor.
                </small>
              </div>
            </div>
            <div className="coaching-summary-side">
              <span className="summary-title">Resumo da Reserva</span>
              <div className="summary-content">
                <div className="summary-item"><span>Taxa Base</span><span>{pricing.baseRate.toFixed(2)} EUR</span></div>
                <div className="summary-item"><span>Taxa Grupo</span><span>{pricing.duetExtra.toFixed(2)} EUR</span></div>
                <div className="summary-item"><span>Taxa Tempo</span><span>{pricing.durationExtra.toFixed(2)} EUR</span></div>
              </div>
              <div className="premium-price-box">
                <span className="label">Total Estimado</span>
                <div className="value">{pricing.total.toFixed(2)} EUR</div>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} disabled={submitting}>
                {submitting ? 'A enviar…' : 'Confirmar Requisição'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
