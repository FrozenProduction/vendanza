import PublicHeader from '../../components/layout/PublicHeader';
import PublicFooter from '../../components/layout/PublicFooter';

export default function Home() {
  return (
    <>
      <PublicHeader
        hero
        heroTitle={
          <>
            ONDE A ARTE GANHA <span className="gold">MOVIMENTO</span>
          </>
        }
        heroSubtitle="Escola de Dança de Braga"
      >
        <div className="btns">
          <button type="button" className="btn-gold">
            VER HORÁRIOS
          </button>
        </div>
      </PublicHeader>
      <PublicFooter />
    </>
  );
}
