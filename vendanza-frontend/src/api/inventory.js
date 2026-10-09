import { ENDPOINTS } from './config';
import { apiJson, fetchComToken } from './client';

export async function fetchInventoryItems() {
  return apiJson(`${ENDPOINTS.inventario}/itens`);
}

export async function createInventoryItem(data) {
  const response = await fetchComToken(`${ENDPOINTS.inventario}/itens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json().catch(() => ({}));
}

export async function updateInventoryItem(id, data) {
  const response = await fetchComToken(`${ENDPOINTS.inventario}/itens/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json().catch(() => ({}));
}

export async function deleteInventoryItem(id) {
  const response = await fetchComToken(`${ENDPOINTS.inventario}/itens/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Erro ao apagar');
}

export async function rentInventoryItem(data) {
  const response = await fetchComToken(`${ENDPOINTS.inventario}/alugar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json().catch(() => ({}));
}

/** Pedido de aluguer à escola (aguarda aprovação da direção). */
export async function submitRentalRequest({ idArtefacto, idEncEducacao, dataInicio, dataFim, valor }) {
  return rentInventoryItem({
    idArtefacto,
    idEncEducacao,
    dataInicio,
    dataFim,
    valor: valor ?? 0,
    estado: 'Aguardar Aprovacao',
  });
}

export async function fetchMyRentals(encarregadoId) {
  return apiJson(`${ENDPOINTS.inventario}/meus-alugueres/${encarregadoId}`);
}

export async function fetchPendingRentals() {
  return apiJson(`${ENDPOINTS.inventario}/alugueres/pendentes`);
}

export async function fetchActiveRentals() {
  return apiJson(`${ENDPOINTS.inventario}/alugueres/ativos`);
}

export async function approveRental(rentalId) {
  const response = await fetchComToken(`${ENDPOINTS.inventario}/aluguer/${rentalId}/aprovar`, {
    method: 'PUT',
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json().catch(() => ({}));
}

export async function rejectRental(rentalId) {
  const response = await fetchComToken(`${ENDPOINTS.inventario}/aluguer/${rentalId}/recusar`, {
    method: 'PUT',
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json().catch(() => ({}));
}

export async function returnRental(rentalId) {
  const response = await fetchComToken(`${ENDPOINTS.inventario}/aluguer/${rentalId}/devolver`, {
    method: 'PUT',
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json().catch(() => ({}));
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}
