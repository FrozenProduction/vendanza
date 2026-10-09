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

export function useGuardianSummary() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({
    mensalidade: `Paga / ${MESES[new Date().getMonth()]}`,
    turmas: '00',
    aulasHoje: '0 / 0h',
    pendentes: '00 Coachings',
    historico: [],
    eventos: [],
    loading: true,
  });

  useEffect(() => {
    const myId = getUserId(user);
    if (!myId) return;

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
        let coachingsPendentes = 0;

        horarios.forEach((h) => {
          if (
            (h.diaSemana === diaSemanaHoje || h.diaSemana === diaSemanaHoje.split('-')[0]) &&
            idsInscritos.includes(h.modalidade?.idModalidade ?? h.idModalidade)
          ) {
            const [h1, m1] = h.horaInicio.split(':').map(Number);
            const [h2, m2] = h.horaFim.split(':').map(Number);
            minutosHoje += h2 * 60 + m2 - (h1 * 60 + m1);
          }
        });

        privadas.forEach((p) => {
          if (p.dia === hojeISO) {
            if (p.estado !== 'Cancelada' && p.estado !== 'Rejeitada') {
              minutosHoje += p.duracao || 60;
            }
            if (['Pendente', 'Agendada', 'Pedido'].includes(p.estado)) {
              coachingsPendentes++;
            }
          }
        });

        const historico = privadas.slice().reverse().slice(0, 10);
        const eventos = privadas
          .filter((p) => p.dia >= hojeISO && ['Agendada', 'Pendente'].includes(p.estado))
          .sort((a, b) => a.dia.localeCompare(b.dia) || a.horaInicio.localeCompare(b.horaInicio))
          .slice(0, 3);

        setSummary({
          mensalidade: `Paga / ${MESES[hoje.getMonth()]}`,
          turmas: String(inscricoes.length).padStart(2, '0'),
          aulasHoje: `0 / ${(minutosHoje / 60).toFixed(1).replace('.0', '')}h`,
          pendentes: `${String(coachingsPendentes).padStart(2, '0')} Coachings`,
          historico,
          eventos,
          loading: false,
        });
      } catch (e) {
        console.error('Erro resumo encarregado:', e);
        if (!cancelled) setSummary((s) => ({ ...s, loading: false }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return summary;
}
