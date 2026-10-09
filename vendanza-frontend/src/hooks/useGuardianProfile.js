import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserId } from '../api/auth';
import { ENDPOINTS } from '../api/config';
import { apiJson } from '../api/client';

export function useGuardianProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ nome: 'A carregar...', telefone: '', nif: '', email: user?.email || '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = getUserId(user);
    if (!userId) return;

    let cancelled = false;

    (async () => {
      try {
        const dados = await apiJson(`${ENDPOINTS.utilizadores}/aluno/${userId}`);
        if (cancelled) return;
        setProfile({
          nome: `${dados.nomeEncEducacao} ${dados.apelidoEncEducacao}`,
          telefone: dados.telefone !== 'A preencher' ? dados.telefone : '',
          nif: dados.nif !== '000000000' ? dados.nif : '',
          email: user.email,
        });
      } catch (e) {
        console.error('Erro ao carregar perfil:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return { profile, loading };
}
