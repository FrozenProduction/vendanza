import { useEffect } from 'react';
import { verifyPastLessons } from '../api/verify';

/** Efeitos ao entrar numa dashboard (como DOMContentLoaded no HTML legado). */
export function useDashboardInit() {
  useEffect(() => {
    verifyPastLessons();
  }, []);
}
