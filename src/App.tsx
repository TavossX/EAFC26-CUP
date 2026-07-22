import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Convite } from './pages/Convite';
import { ConfigurarTorneio } from './pages/ConfigurarTorneio';
import { TorneioLiga } from './pages/TorneioLiga';
import { TorneioMataMata } from './pages/TorneioMataMata';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate replace to="/torneio/configurar" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/convite/:campeonatoId" element={<Convite />} />
        <Route path="/torneio/configurar" element={<ConfigurarTorneio />} />
        <Route path="/torneio/liga" element={<TorneioLiga />} />
        <Route path="/torneio/matamata" element={<TorneioMataMata />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

