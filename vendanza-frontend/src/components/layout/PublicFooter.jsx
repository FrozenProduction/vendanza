import { Link } from 'react-router-dom';

const INSCRICAO_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScRY5Ez7yUfzH5bIby9lK8WMAAnkCOvOZbZnzPY5E0u6HG1PQ/viewform';

export default function PublicFooter() {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-col footer-col-logo">
          <img
            src="/imagens/CERTIFICADOROYALACADEMY.png"
            alt="Registered Royal Academy of Dance Teacher"
            className="rad-logo"
          />
          <h4 className="footer-school-name">Ent'Artes®</h4>
          <p className="footer-certification">
            Escola certificada pela Royal Academy of Dance
            <br />
            com o nº de registo 24116
          </p>
        </div>

        <div className="footer-col footer-col-links">
          <div className="footer-menu-group">
            <h3>
              <Link to="/escola">A Escola</Link>
            </h3>
            <ul className="footer-list">
              <li>
                <a href="#">Modalidades</a>
              </li>
              <li>
                <a href="#">Corpo Docente</a>
              </li>
              <li>
                <a href="#">A nossa História</a>
              </li>
            </ul>
          </div>
          <div className="footer-menu-group">
            <h3>
              <a href="#">Projetos</a>
            </h3>
            <ul className="footer-list">
              <li>
                <a href="#">Plataforma Ent'artes</a>
              </li>
              <li>
                <a href="#">Motus Dance Project</a>
              </li>
              <li>
                <a href="#">Soma das Artes</a>
              </li>
              <li>
                <a href="#">Ent'Artes Studio Training</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-col footer-col-contacts">
          <div className="footer-menu-group">
            <h3>
              <a href={INSCRICAO_URL} target="_blank" rel="noreferrer">
                INSCRIÇÃO
              </a>
            </h3>
            <h3>
              <a href="#">Contactos</a>
            </h3>
          </div>
          <div className="contact-item">
            <p>
              Rua Dr. Manuel de Oliveira Machado,
              <br />
              nº21 e 23, R/ Chão,
              <br />
              4700-054 Braga
            </p>
          </div>
          <div className="contact-item">
            <p>
              (+351) 964 693 247
              <br />
              <span className="phone-call-desc">(Chamada Rede Móvel Nacional PT)</span>
            </p>
          </div>
          <div className="contact-item">
            <p>geral@entartes.pt</p>
          </div>
          <div className="footer-social-custom">
            <a
              href="https://www.facebook.com/entartes.escoladedanca/?locale=pt_PT"
              target="_blank"
              rel="noreferrer"
            >
              <img src="/imagens/FacebookLogo.png" alt="Facebook Ent'Artes" className="social-img" />
            </a>
            <a href="https://www.instagram.com/entartes_escoladedanca/" target="_blank" rel="noreferrer">
              <img src="/imagens/InstagramLogo.jpg" alt="Instagram Ent'Artes" className="social-img" />
            </a>
            <a
              href="https://www.youtube.com/channel/UC8TI5mk7acehVht8wWKNBlQ"
              target="_blank"
              rel="noreferrer"
            >
              <img src="/imagens/YoutubeLogo.png" alt="Youtube Ent'Artes" className="social-img" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
