// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { StartDecision } from './features/decision-maker/StartDecision';
import { DefineCriteria } from './features/decision-maker/DefineCriteria';
import { DefineOptions } from './features/decision-maker/DefineOptions';
import { EvaluationMatrix } from './features/decision-maker/EvaluationMatrix';
import { Results } from './features/decision-maker/Results';
import { Login } from './features/auth/Login';
import { Register } from './features/auth/Register';
import { Dashboard } from './features/dashboard/Dashboard';
import { History } from './features/history/History';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register/>}/>

        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />

          {/* Rutas del flujo de creación de decisiones */}
          <Route path="new-decision" element={<StartDecision />} />
          <Route path="define-criteria" element={<DefineCriteria />} />
          <Route path="define-options" element={<DefineOptions />} />
          <Route path="evaluation-matrix" element={<EvaluationMatrix />} />
          <Route path="results" element={<Results />} />

          {/* NUEVAS RUTAS para arreglar las advertencias de la consola */}
          <Route path="results/:id" element={<div className="p-8 text-xl font-bold">Cargando resultados pasados... (En construcción)</div>} />
          <Route path="continue/:id" element={<div className="p-8 text-xl font-bold">Continuando decisión... (En construcción)</div>} />
          <Route path="history" element={<History />} />
          <Route path="settings" element={<div className="p-8 text-xl font-bold">Configuración de Usuario (En construcción)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;