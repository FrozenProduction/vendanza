export function isEscolaItem(item) {
  return (
    item.idEncEducacao === 52 ||
    (item.idDirecao != null && item.idDirecao !== undefined && item.idDirecao !== 0)
  );
}

/** Peça da escola efetivamente alugada (pedido já aprovado pela direção). */
export function isEscolaRented(item, rentedArtefactoIds) {
  if (!isEscolaItem(item) || !rentedArtefactoIds) return false;
  return rentedArtefactoIds.has(item.id);
}

/**
 * Catálogo geral: peças da escola ficam visíveis com pedidos pendentes;
 * só saem quando existe aluguer ativo. Comunidade usa disponibilidade do anúncio.
 */
export function isVisibleInGeneralCatalog(item, rentedArtefactoIds = null) {
  if (isEscolaItem(item)) {
    return !isEscolaRented(item, rentedArtefactoIds);
  }
  return item.disponibilidade === 'Disponível';
}

export function canRequestEscolaItem(item, rentedArtefactoIds = null) {
  return isEscolaItem(item) && isVisibleInGeneralCatalog(item, rentedArtefactoIds);
}

export function formatInventoryPrice(precoAluguer) {
  return parseFloat(precoAluguer) === 0 ? 'Grátis' : `${parseFloat(precoAluguer).toFixed(2)}€`;
}

export function hasInventoryImage(item) {
  return item.imagem && item.imagem.length > 50;
}
