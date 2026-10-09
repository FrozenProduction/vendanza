import { useEffect } from 'react';

/** Sai da SPA React e abre o painel admin em HTML legado. */
export default function AdminRedirect() {
  useEffect(() => {
    const path = window.location.pathname;
    const target = path.endsWith('.html') ? path : '/admin/admindashboard.html';
    window.location.replace(target);
  }, []);

  return (
    <div className="loading-overlay-app">
      <div className="spinner-app" />
      <p style={{ marginTop: 16, color: '#64748b' }}>A abrir o painel de administração...</p>
    </div>
  );
}
