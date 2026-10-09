const ROW_HEIGHT = 40;
const GRID_START_ROW = 3;
const GAP = 1;

function parseRowStart(start) {
  const timeParts = start.replace('h', ':').split(':').map(Number);
  const h = timeParts[0];
  const m = timeParts.length > 1 ? timeParts[1] : 0;
  return GRID_START_ROW + (h - 9) * 2 + m / 30;
}

export function computeBlockLayout(block) {
  let rowStart = block.rowStart;
  let rowSpan = block.rowSpan;

  if (block.start) {
    rowStart = parseRowStart(block.start);
  }
  if (block.duration != null) {
    let dur = parseFloat(block.duration);
    if (dur <= 0 || Number.isNaN(dur)) dur = 30;
    rowSpan = dur / 30;
  }

  const top = (rowStart - GRID_START_ROW) * ROW_HEIGHT;
  const height = Math.max(rowSpan * ROW_HEIGHT - GAP * 2, ROW_HEIGHT - GAP * 2);

  return { top, height, rowStart, rowSpan };
}

/** Agrupa blocos sobrepostos em colunas lado a lado (mesma lógica do script legado). */
/** @param {Array<{ start: string, duration: number, rowStart?: number, rowSpan?: number }>} blocks */
export function layoutDayBlocks(blocks) {
  const positioned = blocks.map((block) => {
    const { top, height } = computeBlockLayout(block);
    return { block, top, height, left: '0', width: '100%' };
  });

  const sorted = [...positioned].sort((a, b) => a.top - b.top);
  const groups = [];

  sorted.forEach((item) => {
    const bBottom = item.top + item.height;
    let placed = false;
    for (const group of groups) {
      const collides = group.some((g) => {
        const gBottom = g.top + g.height;
        return item.top < gBottom - 1 && bBottom > g.top + 1;
      });
      if (collides) {
        group.push(item);
        placed = true;
        break;
      }
    }
    if (!placed) groups.push([item]);
  });

  groups.forEach((group) => {
    const slots = [];
    const placements = [];

    group.forEach((item) => {
      const bTop = item.top;
      const bHeight = item.height + GAP * 2;
      let slotIdx = slots.findIndex((end) => end <= bTop + 1);
      if (slotIdx === -1) {
        slotIdx = slots.length;
        slots.push(bTop + bHeight);
      } else {
        slots[slotIdx] = bTop + bHeight;
      }
      placements.push({ item, slotIdx });
    });

    const numCols = slots.length;
    const widthPct = 100 / numCols;
    placements.forEach(({ item, slotIdx }) => {
      item.left = `calc(${slotIdx * widthPct}% + ${GAP * 2}px)`;
      item.width = `calc(${widthPct}% - ${GAP * 4}px)`;
    });
  });

  return positioned;
}
