import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { USER_TYPES } from '../../api/config';
import { useDashboardInit } from '../../hooks/useDashboardInit';
import { useGuardianProfile } from '../../hooks/useGuardianProfile';
import { useTeacherProfile } from '../../hooks/useTeacherProfile';
import DashboardProfileModals from './DashboardProfileModals';
import '../../../css/style.css';

const GUARDIAN_MENU = [
  { key: 'profile', label: '👤 O Meu Perfil' },
  { key: 'students', label: '👧 Os Meus Educandos' },
  { key: 'billing', label: '🧾 Faturação e Recibos' },
  { key: 'settings', label: '⚙️ Configurações' },
];

const TEACHER_MENU = [
  { key: 'profile', label: '👤 O Meu Perfil' },
  { key: 'classes', label: '👥 As Minhas Turmas' },
  { key: 'billing', label: '🧾 Meus Recibos e Horas' },
  { key: 'settings', label: '⚙️ Configurações' },
];

export default function DashboardLayout({ role, navItems, basePath, userType }) {
  const { user, logout } = useAuth();
  const isTeacher = userType === USER_TYPES.TEACHER;
  const { profile: guardianProfile } = useGuardianProfile();
  const { profile: teacherProfile } = useTeacherProfile();
  const profile = isTeacher ? teacherProfile : guardianProfile;

  const [menuOpen, setMenuOpen] = useState(false);
  const [openModal, setOpenModal] = useState(null);
  const menuRef = useRef(null);

  useDashboardInit();

  const displayName =
    profile.nome && profile.nome !== 'A carregar...'
      ? profile.nome
      : user?.nome
        ? `${user.nome} ${user.apelido || ''}`.trim()
        : user?.email || 'Utilizador';

  useEffect(() => {
    if (!menuOpen) return undefined;

    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [menuOpen]);

  const openProfileModal = (key) => {
    setOpenModal(key);
    setMenuOpen(false);
  };

  const menuItems = isTeacher ? TEACHER_MENU : GUARDIAN_MENU;

  return (
    <div className="app-dashboard">
      <header>
        <div className="logo">
          <img src="/imagens/LOGOENTARTESESCOLADEDANARBRANCO.png" alt="Logótipo Ent'Artes" />
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path ? `${basePath}/${item.path}` : basePath}
              className={({ isActive }) => `nav-btn${isActive ? ' active' : ''}`}
              end={item.end}
            >
              {item.label}
            </NavLink>
          ))}

          <div
            ref={menuRef}
            className="profile-dropdown"
            onClick={() => setMenuOpen((o) => !o)}
            onKeyDown={(e) => e.key === 'Escape' && setMenuOpen(false)}
            role="button"
            tabIndex={0}
          >
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=00bcd4&color=fff&bold=true`}
              alt="Perfil"
              className="profile-avatar"
            />
            <div className={`profile-menu${menuOpen ? ' show' : ''}`} id="profileMenu">
              <div className="profile-header">
                <strong className="user-name">{displayName}</strong>
                <span>{role}</span>
              </div>
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openProfileModal(item.key);
                  }}
                  className="profile-menu-item"
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '12px 20px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#475569',
                    fontFamily: 'inherit',
                  }}
                >
                  {item.label}
                </button>
              ))}
              <hr style={{ margin: 0, border: 0, borderTop: '1px solid #e2e8f0' }} />
              <button
                type="button"
                className="logout-link"
                onClick={(e) => {
                  e.stopPropagation();
                  logout();
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '12px 20px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                🚪 Sair da Conta
              </button>
            </div>
          </div>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>

      <DashboardProfileModals
        userType={userType}
        displayName={displayName}
        openModal={openModal}
        onCloseModal={() => setOpenModal(null)}
      />
    </div>
  );
}
