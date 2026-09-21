import { ENDPOINTS } from './config';
import { fetchComToken } from './client';

/** Verifica aulas passadas no servidor (como no dashboard legado). */
export async function verifyPastLessons() {
  return fetchComToken(`${ENDPOINTS.verificar}/aulas-realizadas`, { method: 'GET' }).catch(
    () => null,
  );
}
