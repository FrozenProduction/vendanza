import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getUserId } from '../../../api/auth';
import {
  fetchEnrollments,
  fetchPresences,
  fetchSchedules,
  fetchTeachers,
  markPresence,
  PresenceMarkError,
} from '../../../api/schedule';
import ClassInfoModal from '../../../components/schedule/ClassInfoModal';
import ScheduleMapSelect from '../../../components/schedule/ScheduleMapSelect';
import LoadingOverlay from '../../../components/ui/LoadingOverlay';
import { useNotification } from '../../../context/NotificationContext';
import {
  CLOSED_MORNING_BLOCKS,
  DAY_LABELS,
  DIAS_MAPA,
  buildScheduleMapOptions,
  getModalityFilter,
  MODALITY_COLORS,
  TIME_ROWS,
} from '../../../utils/scheduleMaps';
import { layoutDayBlocks } from '../../../utils/timetableLayout';

function calcDurationMin(inicio, fim) {
  const [h1, m1] = inicio.split(':').map(Number);
  const [h2, m2] = fim.split(':').map(Number);
  return h2 * 60 + m2 - (h1 * 60 + m1);
}

function formatTimeRange(inicio, fim) {
  const fmt = (t) => t.substring(0, 5).replace(':', 'h');
  return `${fmt(inicio)} - ${fmt(fim)}`;
}

export default function GuardianSchedule() {
  const { user } = useAuth();
  const userId = getUserId(user);
  const { notify } = useNotification();

  const [loading, setLoading] = useState(true);
  const [horarios, setHorarios] = useState([]);
  const [inscricoes, setInscricoes] = useState([]);
  const [presences, setPresences] = useState(new Set());
  const [selectedMapId, setSelectedMapId] = useState('all');
  const [mobileDay, setMobileDay] = useState(() => {
    const d = new Date().getDay();
    return d === 0 ? 1 : d;
  });
  const [selectedClass, setSelectedClass] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const mapOptions = useMemo(() => buildScheduleMapOptions(inscricoes), [inscricoes]);
  const currentMap = useMemo(
    () => mapOptions.find((m) => m.id === selectedMapId) || mapOptions[0],
    [mapOptions, selectedMapId],
  );

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [allHorarios, insc, docentes, pres] = await Promise.all([
        fetchSchedules(),
        fetchEnrollments(userId),
        fetchTeachers(),
        fetchPresences(userId),
      ]);

      const idsInscritos = insc.map((i) => i.modalidade.idModalidade);
      const filtered = allHorarios.filter((h) => {
        const idMod = h.modalidade?.idModalidade ?? h.idModalidade;
        return idsInscritos.includes(idMod);
      });

      const blocks = filtered.map((h) => {
        const modFiltro = getModalityFilter(h.modalidade?.descricao);
        const doc = docentes.find((d) => d.idDocente === h.idDocente);
        const day = DIAS_MAPA[h.diaSemana];
        return {
          id: `h-${h.idHorario}`,
          idHorario: h.idHorario,
          day,
          modality: modFiltro,
          start: h.horaInicio.substring(0, 5),
          duration: calcDurationMin(h.horaInicio, h.horaFim),
          teacher: doc ? `${doc.nome} ${doc.apelido}` : 'A definir',
          studio: h.idEstudio,
          title: h.modalidade?.descricao || `Modalidade ${h.idModalidade}`,
          time: formatTimeRange(h.horaInicio, h.horaFim),
          colors: MODALITY_COLORS[modFiltro] || MODALITY_COLORS.geral,
          isClosed: false,
        };
      });

      setHorarios(blocks);
      setInscricoes(insc);

      const presSet = new Set();
      pres.forEach((p) => presSet.add(`${p.idHorario}-${p.data}`));
      setPresences(presSet);
    } catch (e) {
      console.error('Erro ao carregar horários:', e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!mapOptions.some((m) => m.id === selectedMapId)) {
      setSelectedMapId(mapOptions[0]?.id || 'all');
    }
  }, [mapOptions, selectedMapId]);

  const visibleBlocks = useMemo(() => {
    const classBlocks = horarios.filter((b) => {
      if (currentMap?.id === 'all') return true;
      return b.modality === currentMap.id;
    });
    return [...CLOSED_MORNING_BLOCKS, ...classBlocks];
  }, [horarios, currentMap]);

  const blocksByDay = useMemo(() => {
    const result = {};
    for (let d = 1; d <= 6; d++) {
      const dayBlocks = visibleBlocks.filter((b) => b.day === d);
      const classOnly = dayBlocks.filter((b) => !b.isClosed);
      const laid = layoutDayBlocks(classOnly);
      const closed = dayBlocks
        .filter((b) => b.isClosed)
        .map((b) => {
          const top = (b.rowStart - 3) * 40;
          const height = Math.max(b.rowSpan * 40 - 2, 38);
          return {
            block: b,
            layout: { top, height, left: '0', width: '100%' },
          };
        });

      result[d] = laid
        .map(({ block, top, height, left, width }) => ({
          block,
          layout: { top, height, left, width },
        }))
        .concat(closed);
    }
    return result;
  }, [visibleBlocks]);

  const openClass = (block) => {
    if (block.isClosed) return;
    setSelectedClass(block);
    setModalOpen(true);
  };

  const getClassDateStr = (block) => {
    const agora = new Date();
    let todayNum = agora.getDay();
    if (todayNum === 0) todayNum = 7;
    const diffDays = block.day - todayNum;
    const classDate = new Date(agora);
    classDate.setDate(agora.getDate() + diffDays);
    const [h, m] = block.start.split(':');
    classDate.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
    const year = classDate.getFullYear();
    const month = String(classDate.getMonth() + 1).padStart(2, '0');
    const day = String(classDate.getDate()).padStart(2, '0');

    return {
      dateStr: `${year}-${month}-${day}`,
      classDate,
      isToday: block.day === todayNum,
      agora,
    };
  };

  const modalState = useMemo(() => {
    if (!selectedClass) return null;
    const { dateStr, classDate, isToday, agora } = getClassDateStr(selectedClass);
    const presenceKey = `${selectedClass.idHorario}-${dateStr}`;
    const hasPresence = presences.has(presenceKey);

    if (!isToday) {
      return {
        statusText: { text: 'Indisponível (Fora do dia)', color: '#64748b' },
        buttonLabel: 'Aguardar dia da aula',
        buttonDisabled: true,
        buttonStyle: { backgroundColor: '#94a3b8' },
        dateStr,
        presenceKey,
        hasPresence,
      };
    }
    if (agora < classDate) {
      return {
        statusText: { text: `Disponível a partir das ${selectedClass.start}`, color: '#64748b' },
        buttonLabel: 'Aguardar início da aula',
        buttonDisabled: true,
        buttonStyle: { backgroundColor: '#94a3b8' },
        dateStr,
        presenceKey,
        hasPresence,
      };
    }
    if (hasPresence) {
      return {
        statusText: { text: 'Presença já registada', color: 'var(--success)' },
        buttonLabel: '✓ Presença Confirmada',
        buttonDisabled: true,
        buttonStyle: { backgroundColor: 'var(--success)' },
        dateStr,
        presenceKey,
        hasPresence,
      };
    }
    return {
      statusText: { text: 'Aula em curso / realizada', color: '#64748b' },
      buttonLabel: 'Marcar Presença',
      buttonDisabled: false,
      buttonStyle: { backgroundColor: 'var(--success)' },
      dateStr,
      presenceKey,
      hasPresence,
    };
  }, [selectedClass, presences]);

  const handleMarkPresence = async () => {
    if (!selectedClass || !modalState || !userId) return;
    setProcessing(true);
    try {
      await markPresence({
        idHorario: selectedClass.idHorario,
        dataAula: modalState.dateStr,
        estado: 'Presente',
        idEncarregado: userId,
      });
      setPresences((prev) => new Set(prev).add(modalState.presenceKey));
      await notify({
        title: 'Sucesso',
        message: 'Presença registada com sucesso!',
        variant: 'success',
      });
      setModalOpen(false);
    } catch (err) {
      const message = err.message || 'Falha de comunicação.';
      await notify({ title: 'Aviso', message, variant: 'warning' });
      if (err instanceof PresenceMarkError && err.status === 400 && modalState.presenceKey) {
        setPresences((prev) => new Set(prev).add(modalState.presenceKey));
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <section className="section-view active">
      <LoadingOverlay visible={loading} />
      <div className="card" style={{ padding: '1.5rem' }}>
        <ScheduleMapSelect
          options={mapOptions}
          value={selectedMapId}
          onChange={setSelectedMapId}
        />

        <div className="mobile-day-selector">
          {DAY_LABELS.map((d) => (
            <button
              key={d.num}
              type="button"
              className={`day-btn${mobileDay === d.num ? ' active' : ''}`}
              onClick={() => setMobileDay(d.num)}
            >
              {d.label.substring(0, 3)}
            </button>
          ))}
        </div>

        <div className="timetable-wrapper">
          <div className={`timetable active-day-${mobileDay}`} id="timetable-grid">
            <div className="time-header" />
            {DAY_LABELS.map((d) => (
              <div key={d.num} className="day-header" data-day={d.num}>
                {d.label}
              </div>
            ))}

            {TIME_ROWS.map((t) => (
              <div key={t.row} className="time-label" style={{ gridRow: t.row }}>
                {t.label}
              </div>
            ))}

            {DAY_LABELS.map((d) => (
              <div
                key={`col-${d.num}`}
                className="day-column"
                id={`col-${d.num}`}
                data-day={d.num}
                style={{ gridColumn: d.num + 1, gridRow: '2 / 29', position: 'relative' }}
              >
                {(blocksByDay[d.num] || []).map(({ block, layout }) => (
                  <div
                    key={block.id}
                    className={block.isClosed ? 'closed-block' : 'class-block'}
                    data-day={block.day}
                    data-modality={block.modality}
                    style={{
                      position: 'absolute',
                      top: layout.top,
                      height: layout.height,
                      left: layout.left,
                      width: layout.width,
                      margin: block.isClosed ? undefined : `${1}px 0`,
                      backgroundColor: block.isClosed ? undefined : block.colors?.bg,
                      borderLeft: block.isClosed ? undefined : `4px solid ${block.colors?.border}`,
                      cursor: block.isClosed ? 'default' : 'pointer',
                      display: block.isClosed ? undefined : 'flex',
                      flexDirection: 'column',
                      padding: block.isClosed ? undefined : '4px 6px',
                      overflow: 'hidden',
                      fontSize: '0.75rem',
                    }}
                    onClick={() => openClass(block)}
                    onKeyDown={(e) => e.key === 'Enter' && openClass(block)}
                    role={block.isClosed ? undefined : 'button'}
                    tabIndex={block.isClosed ? -1 : 0}
                  >
                    {block.isClosed ? (
                      <span>{block.label}</span>
                    ) : (
                      <>
                        <span className="class-title">{block.title}</span>
                        <span className="class-teacher" style={{ marginTop: 2 }}>
                          {block.teacher}
                        </span>
                        <span className="class-room">{block.time}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <ClassInfoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        classInfo={
          selectedClass
            ? {
                title: selectedClass.title,
                teacher: selectedClass.teacher,
                time: selectedClass.time,
                studio: `Estúdio ${selectedClass.studio}`,
              }
            : null
        }
        statusText={modalState?.statusText}
        buttonLabel={modalState?.buttonLabel}
        buttonDisabled={modalState?.buttonDisabled}
        buttonStyle={modalState?.buttonStyle}
        onAction={handleMarkPresence}
        processing={processing}
      />
    </section>
  );
}
