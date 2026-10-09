import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { USER_TYPES } from '../../api/config';
import GuardianInventory from './guardian/GuardianInventory';
import TeacherGestao from './teacher/TeacherGestao';
import TeacherHistory from './teacher/TeacherHistory';
import TeacherHome from './teacher/TeacherHome';
import TeacherSchedule from './teacher/TeacherSchedule';

const NAV = [
  { path: '', label: 'Início', end: true },
  { path: 'horario', label: 'Mapa de Aulas' },
  { path: 'gestao', label: 'Gestão' },
  { path: 'historico', label: 'Histórico' },
  { path: 'inventario', label: 'Inventário' },
];

export default function TeacherDashboard() {
  return (
    <Routes>
      <Route
        element={
          <DashboardLayout
            role="Professor"
            navItems={NAV}
            basePath="/professor"
            userType={USER_TYPES.TEACHER}
          />
        }
      >
        <Route index element={<TeacherHome />} />
        <Route path="horario" element={<TeacherSchedule />} />
        <Route path="gestao" element={<TeacherGestao />} />
        <Route path="historico" element={<TeacherHistory />} />
        <Route path="inventario" element={<GuardianInventory />} />
        <Route path="*" element={<Navigate to="/professor" replace />} />
      </Route>
    </Routes>
  );
}
