import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const INSCRICAO_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScRY5Ez7yUfzH5bIby9lK8WMAAnkCOvOZbZnzPY5E0u6HG1PQ/viewform';

const SLIDES = [
  '/imagens/Fundo1.jpg',
  '/imagens/Fundo2.jpg',
  '/imagens/Fundo3.jpg',
  '/imagens/Fundo4.jpg',
  '/imagens/Fundo5.jpg',
  '/imagens/Fundo6.jpg',
  '/imagens/Fundo7.jpg',
];

export default function PublicHeader({ hero = false, heroTitle, heroSubtitle, children }) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const nav = document.querySelector('.main-header .navbar');
    if (!nav) return undefined;

    const onScroll = () => {
      if (window.scrollY > 45) nav.classList.add('navbar-fixed');
      else nav.classList.remove('navbar-fixed');
    };

    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      nav.classList.remove('navbar-fixed');
    };
  }, [location.pathname]);

  return (
    <header className={`main-header ${hero ? 'site-hero' : 'site-static'}`}>
      {hero && isHome && (
        <div className="slideshow-container">
          {SLIDES.map((src) => (
            <div key={src} className="slide" style={{ backgroundImage: `url('${src}')` }} />
          ))}
        </div>
      )}

      <div className="top-bar">
        <div className="container">
          <div className="top-content">
            <div className="contacts">
              <span>PORTUGAL</span>
              <span>+351 912 345 678</span>
              <span>GERAL@ENTARTES.PT</span>
            </div>
            <div className="social-links">
              <a
                href="https://www.facebook.com/entartes.escoladedanca/?locale=pt_PT"
                target="_blank"
                rel="noreferrer"
              >
                FB
              </a>
              <a href="https://www.instagram.com/entartes_escoladedanca/" target="_blank" rel="noreferrer">
                IG
              </a>
              <a href="https://www.youtube.com/channel/UC8TI5mk7acehVht8wWKNBlQ" target="_blank" rel="noreferrer">
                YT
              </a>
            </div>
          </div>
        </div>
      </div>

      <nav className="navbar">
        <div className="container">
          <div className="nav-wrapper">
            <div className="logo">
              <Link to="/">
                <img src="/imagens/LOGOENTARTESESCOLADEDANARBRANCO.png" alt="Ent'Artes Escola de Dança" />
              </Link>
            </div>
            <ul className="nav-menu">
              <li>
                <Link to="/escola">A ESCOLA</Link>
              </li>
              <li>
                <a href="#">PROJETOS</a>
              </li>
              <li>
                <a href={INSCRICAO_URL} target="_blank" rel="noreferrer">
                  INSCRIÇÃO
                </a>
              </li>
              <li>
                <a href="#">CONTACTO</a>
              </li>
              <li className="login-item">
                <Link to="/login" className="btn-login">
                  LOGIN
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {hero && heroTitle && (
        <div className="hero-text">
          <h1>{heroTitle}</h1>
          {heroSubtitle && <p>{heroSubtitle}</p>}
          {children}
        </div>
      )}
    </header>
  );
}
