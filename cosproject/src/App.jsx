import { Routes, Route } from 'react-router-dom'; // Removed BrowserRouter      <Route index element={<Login />} /> <Route path="/" element={<Login />} /> 
import Login from './Login';
import Dashboard from './Dashboard';
import Modify from './Modify';

function App() {
  return (
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/modify/:id" element={<Modify />} />
    </Routes>
  );
}

export default App;
