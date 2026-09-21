import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getUserId } from '../../../api/auth';
import { fetchSchedules } from '../../../api/schedule';
import ClassInfoModal from '../../../components/schedule/ClassInfoModal';
import LoadingOverlay from '../../../components/ui/LoadingOverlay';
import { useTeacherProfile } from '../../../hooks/useTeacherProfile';
import {
  CLOSED_MORNING_BLOCKS,
  DAY_LABELS,
  DIAS_MAPA,
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

export default function TeacherSchedule() {
  const { user } = useAuth();
  const teacherId = getUserId(user);
  const { profile } = useTeacherProfile();

  const [loading, setLoading] = useState(true);
  const [blocks, setBlocks] = useState([]);
  const [mobileDay, setMobileDay] = useState(() => {
    const d = new Date().getDay();
    return d === 0 ? 1 : d;
  });
  const [selectedClass, setSelectedClass] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const teacherName =
    profile.nome && profile.nome !== 'A carregar...'
      ? profile.nome
      : user?.nome
        ? `${user.nome} ${user.apelido || ''}`.trim()
        : 'Professor';

  const loadData = useCallback(async () => {
    if (!teacherId) return;
    setLoading(true);
    try {
      const horarios = await fetchSchedules();
      const mine = horarios
        .filter((h) => h.idDocente === teacherId)
        .map((h) => {
          const modFiltro = getModalityFilter(h.modalidade?.descricao);
          const day = DIAS_MAPA[h.diaSemana];
          return {
            id: `h-${h.idHorario}`,
            day,
            modality: modFiltro,
            start: h.horaInicio.substring(0, 5),
            duration: calcDurationMin(h.horaInicio, h.horaFim),
            title: h.modalidade?.descricao || 'Turma Regular',
            time: formatTimeRange(h.horaInicio, h.horaFim),
            teacher: teacherName,
            studio: h.idEstudio,
            colors: MODALITY_COLORS[modFiltro] || MODALITY_COLORS.geral,
            isClosed: false,
          };
        });
      setBlocks(mine);
    } catch (e) {
      console.error('Erro ao carregar horário do professor:', e);
    } finally {
      setLoading(false);
    }
  }, [teacherId, teacherName]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const visibleBlocks = useMemo(() => [...CLOSED_MORNING_BLOCKS, ...blocks], [blocks]);

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
          return { block: b, layout: { top, height, left: '0', width: '100%' } };
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

  return (
    <section className="section-view active">
      <LoadingOverlay visible={loading} />
      <div className="card" style={{ padding: '1.5rem' }}>
        <div className="map-navigator">
          <div style={{ width: 40 }} />
          <div style={{ textAlign: 'center' }}>
            <h2>O Meu Horário Regular</h2>
            <p>Turmas semanais atribuídas</p>
          </div>
          <div style={{ width: 40 }} />
        </div>

        <div className="mobile-day-selector">
          {DAY_LABELS.map(({ num, label }) => (
            <button
              key={num}
              type="button"
              className={`day-btn${mobileDay === num ? ' active' : ''}`}
              onClick={() => setMobileDay(num)}
            >
              {label.substring(0, 3)}
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
                      <span>{block.label || 'Manhã Fechada'}</span>
                    ) : (
                      <>
                        <span className="class-title">{block.title}</span>
                        <span className="class-teacher" style={{ marginTop: 2 }}>
                          {block.teacher}
                        </span>
                        <span className="class-room">
                          {block.time} · Est. {block.studio}
                        </span>
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
        readOnly
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
      />
    </section>
  );
}
