import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { USER_TYPES } from '../../api/config';
import GuardianCoaching from './guardian/GuardianCoaching';
import GuardianHome from './guardian/GuardianHome';
import GuardianInventory from './guardian/GuardianInventory';
import GuardianPrivateLessons from './guardian/GuardianPrivateLessons';
import GuardianSchedule from './guardian/GuardianSchedule';

const NAV = [
  { path: '', label: 'Início', end: true },
  { path: 'coaching', label: 'Coaching' },
  { path: 'horario', label: 'Mapa de Aulas' },
  { path: 'aulas-privadas', label: 'Histórico' },
  { path: 'inventario', label: 'Inventário' },
];

export default function GuardianDashboard() {
  return (
    <Routes>
      <Route
        element={
          <DashboardLayout
            role="Encarregado de Educação"
            navItems={NAV}
            basePath="/portal"
            userType={USER_TYPES.GUARDIAN}
          />
        }
      >
        <Route index element={<GuardianHome />} />
        <Route path="coaching" element={<GuardianCoaching />} />
        <Route path="horario" element={<GuardianSchedule />} />
        <Route path="aulas-privadas" element={<GuardianPrivateLessons />} />
        <Route path="inventario" element={<GuardianInventory />} />
        <Route path="*" element={<Navigate to="/portal" replace />} />
      </Route>
    </Routes>
  );
}
