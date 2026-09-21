import { ENDPOINTS } from './config';
import { apiJson, fetchComToken } from './client';

export async function fetchTeacherPrivateLessons(teacherId) {
  return apiJson(`${ENDPOINTS.aulasPrivadas}/docente/${teacherId}`);
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

export async function verifyPastLessons() {
  return fetchComToken(`${ENDPOINTS.verificar}/aulas-realizadas`, { method: 'GET' }).catch(
    () => null,
  );
}
