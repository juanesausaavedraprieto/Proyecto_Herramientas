// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts & Wrappers
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { GuestRoute } from './components/layout/GuestRoute';
import { MainLayout } from './components/layout/MainLayout';
import { AdminLayout } from './components/layout/AdminLayout';// 👈 Layout del Admin

// Auth y Errores
import { Login } from './features/auth/Login';
import { Register } from './features/auth/Register';
import { NotFound } from './features/errors/NotFound';

// Vistas Cliente
import { Dashboard } from './features/dashboard/Dashboard';
import { History } from './features/history/History';
import { Settings } from './features/settings/Settings';
import { Profile } from './features/profile/Profile';

// Vistas Flujo de Decisión
import { StartDecision } from './features/decision-maker/StartDecision';
import { DefineCriteria } from './features/decision-maker/DefineCriteria';
import { DefineOptions } from './features/decision-maker/DefineOptions';
import { EvaluationMatrix } from './features/decision-maker/EvaluationMatrix';
import { Results } from './features/decision-maker/Results';
import { ContinueDecision } from './features/decision-maker/ContinueDecision';

// Vistas Admin
import { AdminDashboard } from './features/admin/AdminDashboard';
import { UserManagement } from './features/admin/UserManagement';
import { GlobalAudit } from './features/admin/GlobalAudit';
import { SystemSettings } from './features/admin/SystemSettings';

function App() {
  // Leemos el rol del usuario desde el almacenamiento local al inicializar
  const role = localStorage.getItem('userRole');

  return (
    <BrowserRouter>
      <Routes>

        {/* RUTAS DE INVITADO (Login / Registro) */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* RUTAS PROTEGIDAS */}
        <Route element={<ProtectedRoute />}>

          {/* 🟦 MUNDO CLIENTE (Solo si NO es admin) */}
          {role !== 'ADMIN' ? (
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="history" element={<History />} />
              <Route path="settings" element={<Settings />} />

              {/* Flujo de Decisiones (Prohibido para Admin) */}
              <Route path="new-decision" element={<StartDecision />} />
              <Route path="define-criteria" element={<DefineCriteria />} />
              <Route path="define-options" element={<DefineOptions />} />
              <Route path="evaluation-matrix" element={<EvaluationMatrix />} />
              <Route path="results/:id?" element={<Results />} /> {/* :id? hace que el parámetro sea opcional */}
              <Route path="continue/:id" element={<ContinueDecision />} />
            </Route>
          ) : (
            // Si es Admin y trata de ir a la raíz del cliente, lo redirigimos a su panel de administración
            <Route path="/" element={<Navigate to="/admin" replace />} />
          )}

          {/* 🟥 MUNDO ADMIN (Solo si ES admin) */}
          {role === 'ADMIN' ? (
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="audit" element={<GlobalAudit />} />
              <Route path="settings" element={<SystemSettings />} />
              {/* Aquí irán Monitoreo Global, Configuración IA, etc. */}
            </Route>
          ) : (
            // Si es Cliente y trata de ir a rutas de /admin, lo redirigimos a su dashboard
            <Route path="/admin/*" element={<Navigate to="/" replace />} />
          )}

        </Route>

        {/* ERROR 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;