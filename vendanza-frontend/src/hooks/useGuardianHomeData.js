import { useEffect, useState } from 'react';
import { getUserId } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { ENDPOINTS } from '../api/config';
import { apiJson } from '../api/client';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const MAPA_DIAS = {
  0: 'Domingo', 1: 'Segunda-feira', 2: 'Terça-feira', 3: 'Quarta-feira',
  4: 'Quinta-feira', 5: 'Sexta-feira', 6: 'Sábado',
};

function calcDuracaoMin(inicio, fim) {
  if (!inicio || !fim) return 0;
  const [h1, m1] = inicio.split(':').map(Number);
  const [h2, m2] = fim.split(':').map(Number);
  return h2 * 60 + m2 - (h1 * 60 + m1);
}

export function useGuardianHomeData() {
  const { user } = useAuth();
  const [data, setData] = useState({
    mensalidade: `Paga / ${MESES[new Date().getMonth()]}`,
    turmas: '00',
    aulasHoje: '0 / 0h',
    pendentes: '00',
    historico: [],
    eventos: [],
    eventDays: [],
    loading: true,
  });

  useEffect(() => {
    const myId = getUserId(user);
    if (!myId) return undefined;

    let cancelled = false;

    (async () => {
      try {
        const [inscricoes, horarios, privadas] = await Promise.all([
          apiJson(`${ENDPOINTS.inscricoes}/aluno/${myId}`).catch(() => []),
          apiJson(ENDPOINTS.horario).catch(() => []),
          apiJson(`${ENDPOINTS.aulasPrivadas}/encarregado/${myId}`).catch(() => []),
        ]);

        if (cancelled) return;

        const hoje = new Date();
        const hojeISO = hoje.toISOString().split('T')[0];
        const diaSemanaHoje = MAPA_DIAS[hoje.getDay()];
        const idsInscritos = inscricoes.map((i) => i.modalidade.idModalidade);

        let minutosHoje = 0;
        let coachingsPendentesHoje = 0;

        horarios.forEach((h) => {
          const idMod = h.modalidade?.idModalidade ?? h.idModalidade;
          if (
            (h.diaSemana === diaSemanaHoje || h.diaSemana === diaSemanaHoje.split('-')[0]) &&
            idsInscritos.includes(idMod)
          ) {
            minutosHoje += calcDuracaoMin(h.horaInicio, h.horaFim);
          }
        });

        privadas.forEach((p) => {
          if (p.dia === hojeISO) {
            if (p.estado !== 'Cancelada' && p.estado !== 'Rejeitada') {
              minutosHoje += p.duracao || 60;
            }
            if (['Pendente', 'Agendada', 'Pedido'].includes(p.estado)) {
              coachingsPendentesHoje++;
            }
          }
        });

        const horasTotaisHoje = (minutosHoje / 60).toFixed(1).replace('.0', '');
        const historico = privadas.slice().reverse().slice(0, 10);

        const eventos = privadas
          .filter((p) => p.dia >= hojeISO && ['Agendada', 'Pendente'].includes(p.estado))
          .sort((a, b) => a.dia.localeCompare(b.dia) || a.horaInicio.localeCompare(b.horaInicio))
          .slice(0, 3);

        const eventDays = [...new Set(privadas.map((p) => p.dia).filter(Boolean))];

        setData({
          mensalidade: `Paga / ${MESES[hoje.getMonth()]}`,
          turmas: String(inscricoes.length).padStart(2, '0'),
          aulasHoje: `0 / ${horasTotaisHoje}h`,
          pendentes: String(coachingsPendentesHoje).padStart(2, '0'),
          historico,
          eventos,
          eventDays,
          loading: false,
        });
      } catch (e) {
        console.error('Erro resumo home encarregado:', e);
        if (!cancelled) setData((s) => ({ ...s, loading: false }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return data;
}
