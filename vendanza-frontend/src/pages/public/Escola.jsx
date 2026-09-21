import '../../../css/escola.css';
import PublicHeader from '../../components/layout/PublicHeader';
import PublicFooter from '../../components/layout/PublicFooter';

export default function Escola() {
  return (
    <div className="page-escola">
      <PublicHeader />
      <section className="page-banner">
        <div className="container">
          <h1>
            A NOSSA <span className="gold">HISTÓRIA</span>
          </h1>
        </div>
      </section>

      <main className="content-section">
        <div className="container grid-content">
          <div className="text-main">
            <h2>ENT'ARTES</h2>
            <p>
              A Ent'Artes - Escola de Dança conta já com mais de 14 anos, durante os quais criou um
              percurso de excelência e mérito quer a nível nacional, quer a nível internacional.
            </p>
            <p>
              A Instituição Bracarense foi já galardoada com a medalha de mérito municipal, recebeu
              mais de 900 distinções incluindo importantes competições a nível mundial (Youth America
              Grand Prix, TanzOlymp, European Grand Prix, Prémio Internacional de Danza Roseta Mauri,
              Dance World Cup, All Dance, Global Dance Open entre outros), bem como diversas bolsas de
              estudo para algumas das mais prestigiadas escolas de dança do mundo (Basel Theater Ballet
              Schule, Zurich Dance Academy, Royal Ballet School, École de Danse de la Ópera de Paris,
              Staaliche BalletSchule Berlin, English National Ballet School entre outras).
            </p>
            <p>
              Focada na formação em dança, a Ent&apos;Artes recebe alunos a partir dos 2 anos e meio e
              disponibiliza aulas das mais diversas modalidades. Para além de um regime lúdico, a
              Ent&apos;Artes oferece também a possibilidade de um trabalho dirigido à formação intensiva em
              dança.
            </p>
            <p>
              Para além do ensino, a Ent&apos;Artes — Escola de Dança — criou vários outros projetos, tais como a
              Plataforma Ent'Artes, o Motus Dance Project, a Soma das Artes e o Ent'Artes Studio Training
              que contemplam a dança de uma forma mais abrangente e profissionalizante.
            </p>
          </div>

          <aside className="side-info">
            <div className="info-block">
              <h3>Os nossos valores</h3>
              <ul className="gold-list">
                <li>Profissionalismo</li>
                <li>Excelência</li>
                <li>Rigor</li>
                <li>Respeito</li>
                <li>Qualidade</li>
              </ul>
            </div>
            <div className="info-block">
              <h3>A nossa missão</h3>
              <p>
                Promover a formação em dança com elevado nível de qualidade e excelência. Sensibilizar o
                público para a dança e contribuir, em todo o nosso percurso, para a valorização e o
                enriquecimento cultural.
              </p>
            </div>
            <div className="info-block">
              <h3>A nossa visão</h3>
              <p>Ser uma instituição de referência, a nível internacional, para a formação em Dança.</p>
            </div>
          </aside>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
