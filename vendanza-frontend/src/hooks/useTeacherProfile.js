import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserId } from '../api/auth';
import { ENDPOINTS } from '../api/config';
import { apiJson } from '../api/client';

export function useTeacherProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    nome: user?.nome ? `${user.nome} ${user.apelido || ''}`.trim() : 'A carregar...',
    telefone: '',
    nif: '',
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = getUserId(user);
    if (!userId) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    (async () => {
      try {
        const dados = await apiJson(`${ENDPOINTS.utilizadores}/docente/${userId}`);
        if (cancelled) return;
        setProfile({
          nome: `${dados.nome} ${dados.apelido}`.trim(),
          telefone: dados.telefone && dados.telefone !== 'A preencher' ? dados.telefone : '',
          nif: dados.nif && dados.nif !== '000000000' ? dados.nif : '',
          email: user?.email || dados.email || '',
        });
      } catch (e) {
        console.error('Erro ao carregar perfil do professor:', e);
        if (!cancelled && user?.nome) {
          setProfile({
            nome: `${user.nome} ${user.apelido || ''}`.trim(),
            email: user.email || '',
          });
        }
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
