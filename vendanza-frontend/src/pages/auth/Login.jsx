import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDashboardPath } from '../../api/config';
import { recuperarPalavraPasse } from '../../api/auth';
import { useNotification } from '../../context/NotificationContext';
import '../../../css/stylelogin.css';

export default function Login() {
  const { login, isAuthenticated, userType, logout } = useAuth();
  const { notify } = useNotification();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRecover, setShowRecover] = useState(false);
  const [recoverEmail, setRecoverEmail] = useState('');

  useEffect(() => {
    document.body.classList.add('login-page');
    return () => document.body.classList.remove('login-page');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Erro: O servidor Backend não está a responder.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecover = async (e) => {
    e.preventDefault();
    try {
      await recuperarPalavraPasse(recoverEmail);
      await notify({
        title: 'Email enviado',
        message:
          'Se o email existir na nossa base de dados, receberá um link de recuperação em breve!',
        variant: 'success',
      });
      setShowRecover(false);
    } catch {
      await notify({
        title: 'Erro',
        message: 'Erro de ligação ao servidor.',
        variant: 'error',
      });
    }
  };

  return (
    <div className="login-layout">
      <div className="video-background">
        <iframe
          src="https://www.youtube-nocookie.com/embed/3NLfrPjZQKY?autoplay=1&mute=1&loop=1&playlist=3NLfrPjZQKY&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3"
          title="Vídeo de fundo Ent'Artes"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      </div>
      <div className="video-overlay" />

      <div className="login-chrome">
        <img src="/imagens/LOGOENTARTESESCOLADEDANARBRANCO.png" alt="Ent'Artes" />
        <Link to="/" className="login-back-link">
          ← Voltar ao Website
        </Link>
      </div>

      <div className="video-tagline">
        <h1>
          ONDE A ARTE GANHA <span className="gold">MOVIMENTO</span>
        </h1>
        <p>Escola de Dança de Braga</p>
      </div>

      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Bem-vindo!</h2>
            <p>Aceda à sua conta para continuar na plataforma.</p>
          </div>

          <div className="auth-tabs">
            <div className="auth-tab active">Entrar</div>
          </div>

          {isAuthenticated && (
            <div
              style={{
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: 10,
                padding: '12px 14px',
                marginBottom: 16,
                fontSize: '0.85rem',
                color: '#0369a1',
              }}
            >
              Já tem sessão iniciada.{' '}
              <a
                href={getDashboardPath(userType)}
                onClick={(e) => {
                  const dest = getDashboardPath(userType);
                  if (dest.startsWith('/admin/')) {
                    e.preventDefault();
                    window.location.assign(dest);
                  }
                }}
                style={{ fontWeight: 700, color: '#0e7490' }}
              >
                Ir para a área reservada
              </a>{' '}
              ou{' '}
              <button
                type="button"
                onClick={logout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0e7490',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                }}
              >
                terminar sessão
              </button>{' '}
              para entrar com outra conta.
            </div>
          )}

          <form id="loginForm" className="auth-form active" onSubmit={handleSubmit}>
            {error && (
              <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: 12 }}>{error}</p>
            )}
            <div className="form-group">
              <label htmlFor="loginEmail">Email</label>
              <input
                type="email"
                id="loginEmail"
                placeholder="O seu email..."
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="loginPassword">Palavra-passe</label>
              <div className="input-pw-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="loginPassword"
                  placeholder="A sua palavra-passe..."
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="toggle-pw-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label="Mostrar palavra-passe"
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>
            <div className="form-meta" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <label className="remember-label">
                <input type="checkbox" /> <span>Lembrar-me</span>
              </label>
              <button
                type="button"
                className="forgot-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}
                onClick={() => setShowRecover(true)}
              >
                Esqueceu-se da palavra-passe?
              </button>
            </div>
            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', marginTop: 10, borderRadius: 50 }}
              disabled={loading}
            >
              {loading ? 'A entrar...' : 'Entrar na Plataforma'}
            </button>
          </form>
        </div>
      </div>

      {showRecover && (
        <div className="modal-overlay visible" onClick={() => setShowRecover(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 400, padding: 30 }}
          >
            <button
              type="button"
              className="close-btn"
              onClick={() => setShowRecover(false)}
              style={{ cursor: 'pointer', float: 'right', fontSize: '1.5rem', border: 'none', background: 'none' }}
            >
              ×
            </button>
            <h2 style={{ marginTop: 0, color: 'var(--secondary)' }}>Recuperar Conta</h2>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: 20 }}>
              Insira o seu email associado à conta. Enviaremos as instruções para redefinir a sua
              palavra-passe.
            </p>
            <form onSubmit={handleRecover}>
              <div className="form-group" style={{ marginBottom: 20, textAlign: 'left' }}>
                <label htmlFor="recuperarEmail">Email *</label>
                <input
                  type="email"
                  id="recuperarEmail"
                  required
                  value={recoverEmail}
                  onChange={(e) => setRecoverEmail(e.target.value)}
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ background: 'white', color: '#64748b', border: '1px solid #cbd5e1', width: '40%' }}
                  onClick={() => setShowRecover(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" style={{ width: '60%', padding: 12 }}>
                  Enviar Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
