export const MAP_CONFIGS_BASE = [
  { id: 'all', title: 'Mapa Geral', sub: 'Todas as modalidades' },
  { id: 'ballet', title: 'Mapa de Ballet', sub: 'RAD / Vaganova' },
  { id: 'contemporaneo', title: 'Mapa de Contemporâneo', sub: 'DC / Modern Jazz' },
  { id: 'acrodance', title: 'Mapa de Acrodance', sub: 'Ginástica e Dança' },
  { id: 'urbanas', title: 'Mapa de Urbanas', sub: 'Hip Hop / Commercial' },
  { id: 'jazz', title: 'Mapa de Jazz', sub: 'Jazz Dance / Musical' },
  { id: 'intensivo', title: 'Regime Intensivo', sub: 'Turmas de Competição e Pré-Profissionais' },
  { id: 'adultos', title: 'Mapa de Adultos', sub: 'Aulas para maiores de 18 anos' },
];

const MODALITY_KEYWORDS = {
  ballet: 'ballet',
  contemporaneo: ['contemporâneo', 'contemporaneo'],
  acrodance: ['acrodance', 'acro'],
  urbanas: ['urbanas', 'hip hop'],
  jazz: 'jazz',
  intensivo: ['intensivo', 'competição'],
  adultos: 'adultos',
};

/** Opções do dropdown: Mapa Geral + mapas das modalidades em que o aluno está inscrito. */
export function buildScheduleMapOptions(inscricoes) {
  const options = [MAP_CONFIGS_BASE[0]];
  if (!inscricoes?.length) return options;

  const inscritosModNames = inscricoes.map((i) => i.modalidade.descricao.toLowerCase());
  const seen = new Set(['all']);

  MAP_CONFIGS_BASE.forEach((config) => {
    if (config.id === 'all') return;
    const keywords = Array.isArray(MODALITY_KEYWORDS[config.id])
      ? MODALITY_KEYWORDS[config.id]
      : [MODALITY_KEYWORDS[config.id]];
    const match = keywords.some((kw) => inscritosModNames.some((desc) => desc.includes(kw)));
    if (match && !seen.has(config.id)) {
      seen.add(config.id);
      options.push(config);
    }
  });

  inscricoes.forEach((ins) => {
    const desc = ins.modalidade?.descricao?.trim();
    if (!desc) return;
    const filterId = getModalityFilter(desc);
    if (filterId === 'geral' || seen.has(filterId)) return;
    const fromBase = MAP_CONFIGS_BASE.find((c) => c.id === filterId);
    if (!fromBase) {
      seen.add(filterId);
      options.push({
        id: filterId,
        title: desc,
        sub: 'Horário desta modalidade',
      });
    }
  });

  return options;
}

/** @deprecated Use buildScheduleMapOptions */
export function filterMapConfigs(inscricoes) {
  return buildScheduleMapOptions(inscricoes);
}

export const DIAS_MAPA = {
  'Segunda-feira': 1,
  'Terça-feira': 2,
  'Quarta-feira': 3,
  'Quinta-feira': 4,
  'Sexta-feira': 5,
  Sábado: 6,
  Segunda: 1,
  Terça: 2,
  Quarta: 3,
  Quinta: 4,
  Sexta: 5,
};

export function getModalityFilter(descricao) {
  const desc = (descricao || '').toLowerCase();
  if (desc.includes('ballet')) return 'ballet';
  if (desc.includes('contemporâneo') || desc.includes('contemporaneo')) return 'contemporaneo';
  if (desc.includes('jazz')) return 'jazz';
  if (desc.includes('acrodance') || desc.includes('acro')) return 'acrodance';
  if (desc.includes('hip hop') || desc.includes('urbanas')) return 'urbanas';
  if (desc.includes('intensivo') || desc.includes('competição')) return 'intensivo';
  if (desc.includes('adultos')) return 'adultos';
  return 'geral';
}

export const MODALITY_COLORS = {
  ballet: { bg: '#fce4ec', border: '#e91e63' },
  contemporaneo: { bg: '#e8faff', border: '#00bcd4' },
  jazz: { bg: '#fff3e0', border: '#ff9800' },
  acrodance: { bg: '#fff8e1', border: '#ffc107' },
  geral: { bg: '#f3e5f5', border: '#9c27b0' },
};

export const CLOSED_MORNING_BLOCKS = [1, 2, 3, 4, 5].map((day) => ({
  id: `closed-${day}`,
  day,
  modality: 'none',
  rowStart: 3,
  rowSpan: 18,
  label: 'Manhã Fechada',
  isClosed: true,
}));

export const TIME_ROWS = Array.from({ length: 28 }, (_, i) => {
  const hour = 9 + Math.floor(i / 2);
  const min = (i % 2) * 30;
  return { row: i + 2, label: `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}` };
});

export const DAY_LABELS = [
  { num: 1, label: 'Segunda' },
  { num: 2, label: 'Terça' },
  { num: 3, label: 'Quarta' },
  { num: 4, label: 'Quinta' },
  { num: 5, label: 'Sexta' },
  { num: 6, label: 'Sábado' },
];
