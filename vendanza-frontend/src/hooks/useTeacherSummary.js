import { useEffect, useState } from 'react';
import { getUserId } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { ENDPOINTS } from '../api/config';
import { apiJson } from '../api/client';
import { fetchTeacherPrivateLessons, verifyPastLessons } from '../api/teacher';

const MAPA_DIAS = {
  1: ['Segunda', 'Segunda-feira'],
  2: ['Terça', 'Terça-feira'],
  3: ['Quarta', 'Quarta-feira'],
  4: ['Quinta', 'Quinta-feira'],
  5: ['Sexta', 'Sexta-feira'],
  6: ['Sábado', 'Sabado'],
};

function calcDuracaoMin(inicio, fim) {
  if (!inicio || !fim) return 0;
  const [h1, m1] = inicio.split(':').map(Number);
  const [h2, m2] = fim.split(':').map(Number);
  return h2 * 60 + m2 - (h1 * 60 + m1);
}

function verificarDiaSemana(diaDB, diaJS) {
  return MAPA_DIAS[diaJS]?.includes(diaDB);
}

function padCount(n) {
  return n > 0 && n < 10 ? `0${n}` : String(n);
}

export function useTeacherSummary() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({
    aulasHojeCount: '0',
    aulasHojeHoras: '0',
    pendentes: '0',
    ganhosCoaching: '0',
    turmas: '0',
    proximasAulas: [],
    eventDays: [],
    loading: true,
  });

  useEffect(() => {
    const myId = getUserId(user);
    if (!myId) return undefined;

    let cancelled = false;

    (async () => {
      try {
        await verifyPastLessons();

        const [horarios, privadas] = await Promise.all([
          apiJson(ENDPOINTS.horario).catch(() => []),
          fetchTeacherPrivateLessons(myId).catch(() => []),
        ]);

        if (cancelled) return;

        const hoje = new Date();
        const diaJS = hoje.getDay();
        const offset = hoje.getTimezoneOffset() * 60000;
        const hojeIso = new Date(hoje - offset).toISOString().split('T')[0];
        const amanha = new Date(hoje);
        amanha.setDate(hoje.getDate() + 1);
        const amanhaIso = new Date(amanha - offset).toISOString().split('T')[0];
        const diaSemanaAmanha = amanha.getDay();

        let totalAulas = 0;
        let totalMinutos = 0;

        horarios
          .filter((h) => h.idDocente === myId && verificarDiaSemana(h.diaSemana, diaJS))
          .forEach((h) => {
            totalAulas += 1;
            totalMinutos += calcDuracaoMin(h.horaInicio, h.horaFim);
          });

        privadas
          .filter(
            (p) =>
              p.dia === hojeIso &&
              ['Agendada', 'Realizada', 'Concluída', 'Concluida'].includes(p.estado),
          )
          .forEach((p) => {
            totalAulas += 1;
            totalMinutos += calcDuracaoMin(p.horaInicio, p.horaFim);
          });

        const pendentes = privadas.filter(
          (p) => p.estado === 'Pedido' || p.estado === 'Pendente',
        ).length;

        const mesAtual = hoje.getMonth();
        const anoAtual = hoje.getFullYear();
        const ganhos = privadas
          .filter((aula) => {
            const dataAula = new Date(aula.dia);
            const estadoValido =
              aula.estado === 'Concluída' ||
              aula.estado === 'Concluida' ||
              aula.estado === 'Realizada';
            return (
              estadoValido &&
              dataAula.getMonth() === mesAtual &&
              dataAula.getFullYear() === anoAtual
            );
          })
          .reduce((soma, aula) => soma + (aula.preco || 0), 0);

        const turmasUnicas = new Set(
          horarios.filter((h) => h.idDocente === myId).map((h) => h.idAula),
        ).size;

        const listaAulas = [];

        horarios
          .filter((h) => h.idDocente === myId)
          .forEach((h) => {
            let label = null;
            if (verificarDiaSemana(h.diaSemana, diaJS)) label = 'Hoje';
            else if (verificarDiaSemana(h.diaSemana, diaSemanaAmanha)) label = 'Amanhã';
            if (label) {
              listaAulas.push({
                titulo: h.modalidade ? h.modalidade.descricao : 'Aula Regular',
                sub: `Regular (${label} ${h.horaInicio.substring(0, 5)})`,
                ordem: `${label === 'Hoje' ? '0_' : '1_'}${h.horaInicio}`,
              });
            }
          });

        privadas.forEach((p) => {
          const label =
            p.dia === hojeIso ? 'Hoje' : p.dia === amanhaIso ? 'Amanhã' : null;
          if (label && ['Pedido', 'Pendente', 'Agendada'].includes(p.estado)) {
            const nomeAluno = p.encEducacao
              ? p.encEducacao.nomeAluno || p.encEducacao.nomeEncEducacao
              : 'Aluno';
            listaAulas.push({
              titulo: `Coaching: ${nomeAluno}`,
              sub: `${p.estado} (${label} ${p.horaInicio?.substring(0, 5) || '--:--'})`,
              ordem: `${label === 'Hoje' ? '0_' : '1_'}${p.horaInicio || ''}`,
            });
          }
        });

        listaAulas.sort((a, b) => a.ordem.localeCompare(b.ordem));

        const eventDays = new Set(privadas.map((p) => p.dia).filter(Boolean));
        horarios
          .filter((h) => h.idDocente === myId)
          .forEach(() => {
            eventDays.add(hojeIso);
          });

        setSummary({
          aulasHojeCount: padCount(totalAulas),
          aulasHojeHoras: (totalMinutos / 60).toFixed(1).replace('.0', ''),
          pendentes: padCount(pendentes),
          ganhosCoaching: ganhos.toFixed(2),
          turmas: padCount(turmasUnicas),
          proximasAulas: listaAulas.slice(0, 4),
          eventDays: Array.from(eventDays),
          loading: false,
        });
      } catch (e) {
        console.error('Erro resumo professor:', e);
        if (!cancelled) setSummary((s) => ({ ...s, loading: false }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return summary;
}
