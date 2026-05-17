// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { StartDecision } from './features/decision-maker/StartDecision';
import { DefineCriteria } from './features/decision-maker/DefineCriteria';
import { DefineOptions } from './features/decision-maker/DefineOptions';
import { EvaluationMatrix } from './features/decision-maker/EvaluationMatrix';
import { Results } from './features/decision-maker/Results';
import { ContinueDecision } from './features/decision-maker/ContinueDecision';
import { Login } from './features/auth/Login';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { NotFound } from './features/errors/NotFound';
import { GuestRoute } from './components/layout/GuestRoute';
import { AdminRoute } from './components/layout/AdminRoute';
import { UserManagement } from './features/admin/UserManagement';
import { Register } from './features/auth/Register';
import { Dashboard } from './features/dashboard/Dashboard';
import { History } from './features/history/History';
import { Settings } from './features/settings/Settings';
import { Profile } from './features/profile/Profile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route element={<ProtectedRoute />}>

        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />

          {/* Rutas del flujo de creación de decisiones */}
          <Route path="new-decision" element={<StartDecision />} />
          <Route path="define-criteria" element={<DefineCriteria />} />
          <Route path="define-options" element={<DefineOptions />} />
          <Route path="evaluation-matrix" element={<EvaluationMatrix />} />
          <Route path="results" element={<Results />} />

          {/* NUEVAS RUTAS para arreglar las advertencias de la consola */}
          <Route path="results/:id" element={<Results />}/>
          <Route path="continue/:id" element={<ContinueDecision />} />
          <Route path="history" element={<History />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
          </Route>
        </Route>
        <Route element={<AdminRoute />}>
          <Route path="admin/users" element={<UserManagement />} />
          {/* Aquí irán más rutas de admin si las necesitas */}
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      
    </BrowserRouter>
  );
}

export default App;