import { ENDPOINTS, getDashboardPath } from './config';
import { fetchComToken } from './client';

export async function login(email, password) {
  const response = await fetchComToken(`${ENDPOINTS.utilizadores}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password: password.trim() }),
  });

  if (!response.ok) {
    const erroTexto = await response.text();
    throw new Error(erroTexto || 'Credenciais inválidas!');
  }

  const data = await response.json();
  localStorage.setItem('token', data.token);
  localStorage.setItem('usuarioLogado', JSON.stringify(data.utilizador));

  return {
    user: data.utilizador,
    redirectTo: getDashboardPath(data.utilizador.tipo),
  };
}

export async function recuperarPalavraPasse(email) {
  const response = await fetchComToken(`${ENDPOINTS.utilizadores}/recuperar-passe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error('Ocorreu um erro no servidor. Tente novamente.');
  }
}

export function logout() {
  localStorage.removeItem('usuarioLogado');
  localStorage.removeItem('token');
}

export function getStoredUser() {
  const raw = localStorage.getItem('usuarioLogado');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getUserType(user) {
  if (!user) return null;
  const tipo = user.tipo ?? user.cod_tipo ?? user.Cod_Tipo;
  return parseInt(tipo, 10);
}

export function getUserId(user) {
  if (!user) return null;
  return (
    user.id ??
    user.idEncEducacao ??
    user.ID_EncEducacao ??
    user.idDocente ??
    user.idDirecao
  );
}
