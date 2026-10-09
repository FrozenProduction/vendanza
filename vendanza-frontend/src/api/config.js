export const API_BASE = 'https://vendanza-api.onrender.com/api';

/* Desenvolvimento local:
export const API_BASE = 'http://localhost:8080/api';
*/

export const ENDPOINTS = {
  utilizadores: `${API_BASE}/utilizadores`,
  inventario: `${API_BASE}/inventario`,
  horario: `${API_BASE}/horario`,
  modalidade: `${API_BASE}/modalidade`,
  aulas: `${API_BASE}/aulas`,
  estudios: `${API_BASE}/estudios`,
  tipoAula: `${API_BASE}/tipoaula`,
  presencas: `${API_BASE}/presencas`,
  inscricoes: `${API_BASE}/inscricoes`,
  aulasPrivadas: `${API_BASE}/aulas-privadas`,
  verificar: `${API_BASE}/verificar`,
};

export const USER_TYPES = {
  TEACHER: 1,
  GUARDIAN: 2,
  ADMIN: 3,
};

export function getDashboardPath(tipo) {
  const t = parseInt(tipo, 10);
  if (t === USER_TYPES.ADMIN) return '/admin/admindashboard.html';
  if (t === USER_TYPES.TEACHER) return '/professor';
  if (t === USER_TYPES.GUARDIAN) return '/portal';
  return '/login';
}

export function isAdminDashboardPath(path) {
  return path.startsWith('/admin');
}
