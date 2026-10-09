/**
 * Filtro do mapa de aulas (substitui setas de navegação).
 */
export default function ScheduleMapSelect({ options, value, onChange }) {
  const selected = options.find((o) => o.id === value) || options[0];

  return (
    <div className="schedule-map-filter">
      <div className="schedule-map-filter__header">
        <div>
          <h2 className="schedule-map-filter__title">{selected?.title || 'Mapa de Aulas'}</h2>
          {selected?.sub && <p className="schedule-map-filter__subtitle">{selected.sub}</p>}
        </div>
      </div>
      <div className="schedule-map-filter__control">
        <label htmlFor="schedule-map-select" className="schedule-map-filter__label">
          Filtrar horário
        </label>
        <div className="schedule-map-filter__select-wrap">
          <select
            id="schedule-map-select"
            className="schedule-map-filter__select"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          >
            {options.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.title}
              </option>
            ))}
          </select>
          <span className="schedule-map-filter__chevron" aria-hidden>
            ▾
          </span>
        </div>
      </div>
    </div>
  );
}
