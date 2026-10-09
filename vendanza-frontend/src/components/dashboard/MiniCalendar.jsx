import { useMemo, useState } from 'react';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const DAY_NAMES = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export default function MiniCalendar({ eventDays = [] }) {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selectedKey, setSelectedKey] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
  );

  const eventSet = useMemo(() => new Set(eventDays), [eventDays]);

  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    const result = [];

    DAY_NAMES.forEach((d) => result.push({ type: 'label', label: d }));

    for (let i = firstDay - 1; i >= 0; i--) {
      result.push({ type: 'muted', day: prevMonthDays - i });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday =
        day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      result.push({
        type: 'day',
        day,
        dateStr,
        isToday,
        hasEvent: eventSet.has(dateStr),
        active: selectedKey === dateStr,
      });
    }

    const totalCells = firstDay + daysInMonth;
    const nextDays = Math.ceil(totalCells / 7) * 7 - totalCells;
    for (let i = 1; i <= nextDays; i++) {
      result.push({ type: 'muted', day: i });
    }

    return result;
  }, [year, month, eventSet, selectedKey, today]);

  const changeMonth = (step) => {
    let m = month + step;
    let y = year;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    setMonth(m);
    setYear(y);
  };

  return (
    <>
      <div className="cal-header">
        <span>
          {MONTH_NAMES[month]} {year}
        </span>
        <div style={{ display: 'flex', gap: 10, color: '#94a3b8', cursor: 'pointer', userSelect: 'none' }}>
          <span role="button" tabIndex={0} onClick={() => changeMonth(-1)} onKeyDown={(e) => e.key === 'Enter' && changeMonth(-1)}>
            &lt;
          </span>
          <span role="button" tabIndex={0} onClick={() => changeMonth(1)} onKeyDown={(e) => e.key === 'Enter' && changeMonth(1)}>
            &gt;
          </span>
        </div>
      </div>
      <div className="cal-grid">
        {cells.map((cell, idx) => {
          if (cell.type === 'label') {
            return (
              <div key={`l-${idx}`} className="day-name">
                {cell.label}
              </div>
            );
          }
          if (cell.type === 'muted') {
            return (
              <div key={`m-${idx}`} className="day muted">
                <span>{cell.day}</span>
              </div>
            );
          }
          return (
            <div
              key={cell.dateStr}
              className={`day${cell.active || cell.isToday ? ' active' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedKey(cell.dateStr)}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedKey(cell.dateStr)}
            >
              <span>{cell.day}</span>
              {cell.hasEvent && <div className="event-dot" />}
            </div>
          );
        })}
      </div>
    </>
  );
}
