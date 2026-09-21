export function calculateCoachingPrice(format, durationMinutes) {
  const baseRate = 36;
  let duetExtra = 0;
  let durationExtra = 0;

  if (format === 'duet') duetExtra = baseRate * 0.25;
  if (format === 'trio') duetExtra = baseRate * 0.5;
  if (format === 'ensemble') duetExtra = baseRate * 0.75;

  const duration = parseInt(durationMinutes, 10) || 30;
  if (duration === 60) durationExtra = (baseRate + duetExtra) * 0.5;
  if (duration === 90) durationExtra = (baseRate + duetExtra) * 0.75;
  if (duration === 120) durationExtra = baseRate + duetExtra;

  const total = baseRate + duetExtra + durationExtra;
  return {
    baseRate,
    duetExtra,
    durationExtra,
    total,
  };
}

export function validateCoachingDateTime(date, startTime, durationMinutes) {
  if (!date || !startTime) return { valid: true };

  const [hours, minutes] = startTime.split(':').map(Number);
  const [year, month, dayNum] = date.split('-').map(Number);
  const dayDate = new Date(year, month - 1, dayNum);
  const day = dayDate.getDay();

  if (day === 0) {
    return { valid: false, message: 'Não são permitidas marcações aos Domingos.' };
  }

  if (minutes !== 0 && minutes !== 15 && minutes !== 30) {
    return {
      valid: false,
      message: 'A hora de início deve ser em intervalos de 15 minutos (Ex: :00, :15, :30).',
    };
  }

  const startTotal = hours * 60 + minutes;
  const endTotal = startTotal + (parseInt(durationMinutes, 10) || 30);
  const maxEndTotal = 22 * 60 + 30;
  const minStartTotal = day === 6 ? 9 * 60 : 18 * 60;

  if (startTotal < minStartTotal) {
    const timeStr = day === 6 ? '09:00' : '18:00';
    return { valid: false, message: `Para este dia, o horário mínimo de início é ${timeStr}.` };
  }

  if (endTotal > maxEndTotal) {
    const maxStart = Math.floor((maxEndTotal - durationMinutes) / 60);
    const maxMin = (maxEndTotal - durationMinutes) % 60;
    return {
      valid: false,
      message: `A aula não pode terminar depois das 22:30. Com ${durationMinutes} min, a hora máxima de início seria ${maxStart}h${maxMin}.`,
    };
  }

  return { valid: true };
}
