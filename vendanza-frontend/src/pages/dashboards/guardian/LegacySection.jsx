/** Placeholder temporário para rotas do professor ainda não migradas. */
export default function LegacySection({ title, description, legacyPath }) {
  return (
    <section className="section-view active">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>{title}</h2>
        {description && <p style={{ color: '#64748b' }}>{description}</p>}
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          Módulo do professor em migração para React.
        </p>
        <a href={legacyPath} className="btn-primary" style={{ display: 'inline-block', marginTop: 16, textDecoration: 'none' }}>
          Abrir versão legada
        </a>
      </div>
    </section>
  );
}
