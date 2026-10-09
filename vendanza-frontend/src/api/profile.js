import { ENDPOINTS } from './config';
import { fetchComToken } from './client';

export async function updateUserProfile(userId, payload) {
  const response = await fetchComToken(`${ENDPOINTS.utilizadores}/perfil/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error('Erro ao atualizar o perfil');
  }
  return response.json().catch(() => ({}));
}
