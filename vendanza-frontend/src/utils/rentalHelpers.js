export const RENTAL_STATES = {
  PENDING: 'Aguardar Aprovacao',
  PENDING_LEGACY: 'Aguardar Aprovação',
  ACTIVE: 'Em Aluguer',
  REJECTED: 'Recusado',
  DONE: 'Concluído',
};

export function formatRentalDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatRentalDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getTimeUntilReturn(dataFim) {
  if (!dataFim) return '—';
  const end = new Date(dataFim);
  const now = new Date();
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) {
    return 'Prazo de entrega ultrapassado — aguarde confirmação da escola';
  }

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);

  if (days > 0) {
    return `Faltam ${days} dia(s) e ${hours}h para entregar`;
  }
  if (hours > 0) {
    return `Faltam ${hours}h e ${minutes}min para entregar`;
  }
  return `Faltam ${minutes} minuto(s) para entregar`;
}

export function isPendingRental(estado) {
  if (!estado) return false;
  const n = estado
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
  return n.includes('aguardar') && n.includes('aprova');
}

export function rentalStateLabel(estado) {
  if (isPendingRental(estado)) return 'Aguarda aprovação';
  switch (estado) {
    case RENTAL_STATES.ACTIVE:
      return 'Em aluguer';
    case RENTAL_STATES.REJECTED:
      return 'Recusado';
    case RENTAL_STATES.DONE:
      return 'Concluído';
    default:
      return estado || '—';
  }
}

export function rentalStateColor(estado) {
  if (isPendingRental(estado)) return { bg: '#fef3c7', color: '#b45309' };
  switch (estado) {
    case RENTAL_STATES.ACTIVE:
      return { bg: '#dbeafe', color: '#1d4ed8' };
    case RENTAL_STATES.REJECTED:
      return { bg: '#fee2e2', color: '#b91c1c' };
    case RENTAL_STATES.DONE:
      return { bg: '#f1f5f9', color: '#475569' };
    default:
      return { bg: '#f1f5f9', color: '#475569' };
  }
}
