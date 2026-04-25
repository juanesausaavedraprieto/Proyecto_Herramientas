// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { StartDecision } from './features/decision-maker/StartDecision';
import { DefineCriteria } from './features/decision-maker/DefineCriteria';
import { DefineOptions } from './features/decision-maker/DefineOptions';
import { EvaluationMatrix } from './features/decision-maker/EvaluationMatrix';
import { Results } from './features/decision-maker/Results';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Redireccionar el dashboard por defecto a nueva decisión temporalmente */}
          <Route index element={<Navigate to="/new-decision" replace />} />
          <Route path="new-decision" element={<StartDecision />} />

          {/* Rutas placeholder para ver que funciona el menú */}
          <Route path="history" element={<div className="text-2xl font-bold text-gray-400">Próximamente: Historial</div>} />
          <Route path="settings" element={<div className="text-2xl font-bold text-gray-400">Próximamente: Configuración</div>} />
          <Route path="define-criteria" element={<DefineCriteria />} />
          <Route path="define-options" element={<DefineOptions />} />
          <Route path="evaluation-matrix" element={<EvaluationMatrix />} />
          <Route path="results" element={<Results />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;