import { ENDPOINTS } from './config';
import { apiJson, fetchComToken } from './client';

export async function fetchStudios() {
  return apiJson(`${ENDPOINTS.estudios}/estudios`);
}

export async function fetchModalities() {
  return apiJson(`${ENDPOINTS.modalidade}/modalidades`);
}

export async function fetchEnrollmentsForStudent(userId) {
  return apiJson(`${ENDPOINTS.inscricoes}/aluno/${userId}`);
}

export async function fetchModalityTeachers() {
  return apiJson(`${ENDPOINTS.modalidade}/modalidade-docente`);
}

export async function submitCoachingRequest(payload) {
  const response = await fetchComToken(ENDPOINTS.aulasPrivadas, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Erro ao enviar pedido');
  }
  return response.json().catch(() => ({}));
}
