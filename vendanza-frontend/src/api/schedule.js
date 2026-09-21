import { ENDPOINTS } from './config';
import { apiJson, fetchComToken } from './client';

export async function fetchSchedules() {
  return apiJson(ENDPOINTS.horario);
}

export async function fetchTeachers() {
  return apiJson(`${ENDPOINTS.utilizadores}/docentes`);
}

export async function fetchEnrollments(userId) {
  return apiJson(`${ENDPOINTS.inscricoes}/aluno/${userId}`);
}

export async function fetchPresences(userId) {
  return apiJson(`${ENDPOINTS.presencas}/aluno/${userId}`);
}

export class PresenceMarkError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'PresenceMarkError';
    this.status = status;
  }
}

export async function markPresence(payload) {
  const response = await fetchComToken(`${ENDPOINTS.presencas}/marcar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new PresenceMarkError(data.message || 'Erro ao marcar presença', response.status);
  }
  return response.json().catch(() => ({}));
}

export async function fetchPrivateLessons(userId) {
  return apiJson(`${ENDPOINTS.aulasPrivadas}/encarregado/${userId}`);
}

export async function updatePrivateLessonState(id, estado) {
  const response = await fetchComToken(`${ENDPOINTS.aulasPrivadas}/${id}/estado`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado }),
  });
  if (!response.ok) throw new Error('Erro ao atualizar o estado da aula');
  return response.json().catch(() => ({}));
}
