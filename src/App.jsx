import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import Layout from './components/Layout/Layout';
import Home from './views/Home/Home';
import GruposList from './views/Grupos/GruposList/GruposList';
import GruposDetail from './views/Grupos/GruposDetail/GruposDetail';
import GruposForm from './views/Grupos/GruposForm/GruposForm';
import ClasesList from './views/Clases/ClasesList/ClasesList';
import ClasesDetail from './views/Clases/ClasesDetail/ClasesDetail';
import ClasesForm from './views/Clases/ClasesForm/ClasesForm';
import ApuntePublico from './views/Apuntes/ApuntePublico/ApuntePublico';
import TareaPublica from './views/Tareas/TareaPublica/TareaPublica';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas (sin layout) */}
          <Route path="/api/apuntes/publico/:link" element={<ApuntePublico />} />
          <Route path="/api/tareas/publico/:link" element={<TareaPublica />} />
          
          {/* Rutas con layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="grupos" element={<GruposList />} />
            <Route path="grupos/nuevo" element={<GruposForm />} />
            <Route path="grupos/:id" element={<GruposDetail />} />
            <Route path="grupos/:id/editar" element={<GruposForm />} />
            <Route path="clases" element={<ClasesList />} />
            <Route path="clases/nuevo" element={<ClasesForm />} />
            <Route path="clases/:id" element={<ClasesDetail />} />
            <Route path="clases/:id/editar" element={<ClasesForm />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
